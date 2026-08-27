import { PrismaClient, User, Post } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Shared password for every sample account below (for local login/demo only).
const SAMPLE_PASSWORD = 'password123';

const SAMPLE_USERS = [
  {
    username: 'ava_wilder',
    displayName: 'Ava Wilder',
    bio: 'Chasing golden hour 📸 · Portland, OR',
    avatarSeed: 1,
  },
  {
    username: 'leo_martins',
    displayName: 'Leo Martins',
    bio: 'Coffee, code, repeat ☕️',
    avatarSeed: 12,
  },
  {
    username: 'mia_chen',
    displayName: 'Mia Chen',
    bio: 'Plant mom 🌿 | illustrator',
    avatarSeed: 5,
  },
  {
    username: 'noah_reyes',
    displayName: 'Noah Reyes',
    bio: 'Trail runner. Slow mornings, fast miles.',
    avatarSeed: 22,
  },
  {
    username: 'sofia_park',
    displayName: 'Sofia Park',
    bio: 'Home cook sharing weeknight wins 🍳',
    avatarSeed: 33,
  },
  {
    username: 'kenji_ito',
    displayName: 'Kenji Ito',
    bio: 'Analog cameras & city walks 🎞️',
    avatarSeed: 44,
  },
  {
    username: 'zoe_bennett',
    displayName: 'Zoe Bennett',
    bio: 'Studio potter · small batch mugs',
    avatarSeed: 55,
  },
  {
    username: 'diego_cruz',
    displayName: 'Diego Cruz',
    bio: 'Weekend surfer, weekday designer 🌊',
    avatarSeed: 66,
  },
] as const;

const SAMPLE_POSTS: Record<string, { caption: string; imageSeed: string }[]> = {
  ava_wilder: [
    { caption: 'Sunrise over the coast this morning 🌅', imageSeed: 'ava-1' },
    { caption: 'New lens, same obsession with light.', imageSeed: 'ava-2' },
    { caption: 'Foggy hikes hit different.', imageSeed: 'ava-3' },
  ],
  leo_martins: [
    { caption: 'Shipped a side project at 2am, worth it.', imageSeed: 'leo-1' },
    { caption: 'Home office got a small upgrade.', imageSeed: 'leo-2' },
    { caption: 'Diving into Tech & AI side projects this week 🤖', imageSeed: 'leo-3' },
    { caption: 'Finally documented our Design Systems tokens 🎨', imageSeed: 'leo-4' },
  ],
  mia_chen: [
    { caption: 'New sketch for the zine 🌿', imageSeed: 'mia-1' },
    { caption: 'The monstera finally sprouted a new leaf!', imageSeed: 'mia-2' },
    { caption: 'Studio corner on a rainy day.', imageSeed: 'mia-3' },
    { caption: 'Playing with generative Tech & AI tools for illustration 🤖', imageSeed: 'mia-4' },
  ],
  noah_reyes: [
    { caption: '10 miles before breakfast.', imageSeed: 'noah-1' },
    { caption: 'Trail conditions were perfect today.', imageSeed: 'noah-2' },
  ],
  sofia_park: [
    { caption: 'Weeknight ramen, 20 minutes start to finish.', imageSeed: 'sofia-1' },
    { caption: 'Sunday meal prep in full swing.', imageSeed: 'sofia-2' },
    { caption: 'First attempt at sourdough — not bad!', imageSeed: 'sofia-3' },
  ],
  kenji_ito: [
    { caption: 'Shot on film, developed at home.', imageSeed: 'kenji-1' },
    { caption: 'Quiet street, loud colors.', imageSeed: 'kenji-2' },
    { caption: 'New Audio gear for scoring my film reels 🎧', imageSeed: 'kenji-3' },
  ],
  zoe_bennett: [
    { caption: 'New glaze test came out of the kiln 🏺', imageSeed: 'zoe-1' },
    { caption: 'Restocking the shop this weekend.', imageSeed: 'zoe-2' },
    { caption: 'Audio journaling my studio sessions lately 🎙️', imageSeed: 'zoe-3' },
  ],
  diego_cruz: [
    { caption: 'Dawn patrol was worth the alarm.', imageSeed: 'diego-1' },
    { caption: 'Redesigned my portfolio, feedback welcome.', imageSeed: 'diego-2' },
    { caption: 'Building our component library — Design Systems all day 🎨', imageSeed: 'diego-3' },
  ],
};

const SAMPLE_COMMENTS = [
  'This is amazing! 😍',
  'Love the colors here.',
  'Okay but how?!',
  'Need this in my life.',
  'Great shot 👏',
  'So good, saving this.',
  'Wow, incredible work.',
  'This made my day.',
];

function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length];
}

async function main() {
  await prisma.featureFlag.upsert({
    where: { key: 'chat' },
    update: {},
    create: { key: 'chat', enabled: true, rolloutPercentage: 100 },
  });

  if (process.env.ADMIN_EMAIL) {
    const user = await prisma.user.findUnique({
      where: { email: process.env.ADMIN_EMAIL },
    });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      });
    } else {
      console.warn(`ADMIN_EMAIL set but no user found with that email yet`);
    }
  }

  // --- Sample data below is for local development / demos only. ---
  const passwordHash = await bcrypt.hash(SAMPLE_PASSWORD, 10);

  const users: User[] = [];
  for (const sample of SAMPLE_USERS) {
    const user = await prisma.user.upsert({
      where: { username: sample.username },
      update: {},
      create: {
        email: `${sample.username}@example.com`,
        username: sample.username,
        passwordHash,
        displayName: sample.displayName,
        bio: sample.bio,
        avatarUrl: `https://i.pravatar.cc/300?img=${sample.avatarSeed}`,
      },
    });
    users.push(user);
  }

  const posts: Post[] = [];
  for (const user of users) {
    const samplePosts = SAMPLE_POSTS[user.username] ?? [];
    for (const samplePost of samplePosts) {
      const existing = await prisma.post.findFirst({
        where: { authorId: user.id, caption: samplePost.caption },
      });
      const post =
        existing ??
        (await prisma.post.create({
          data: {
            authorId: user.id,
            caption: samplePost.caption,
            imageUrl: `https://picsum.photos/seed/${samplePost.imageSeed}/900/700`,
          },
        }));
      posts.push(post);
    }
    if (samplePosts.length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { postsCount: samplePosts.length },
      });
    }
  }

  // Everyone follows everyone else (small friendly network for demo purposes).
  for (const follower of users) {
    for (const followee of users) {
      if (follower.id === followee.id) continue;
      await prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: follower.id,
            followingId: followee.id,
          },
        },
        update: {},
        create: { followerId: follower.id, followingId: followee.id },
      });
    }
  }
  await prisma.user.updateMany({
    data: { followersCount: users.length - 1, followingCount: users.length - 1 },
  });

  // Deterministic, varied likes + comments per post.
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const likers = users.filter((_, idx) => (idx + i) % 2 === 0);
    for (const liker of likers) {
      await prisma.like.upsert({
        where: { postId_userId: { postId: post.id, userId: liker.id } },
        update: {},
        create: { postId: post.id, userId: liker.id },
      });
    }

    const commenters = users.filter((_, idx) => (idx + i) % 3 === 0);
    for (const [c, commenter] of commenters.entries()) {
      const existingComment = await prisma.comment.findFirst({
        where: { postId: post.id, authorId: commenter.id },
      });
      if (!existingComment) {
        await prisma.comment.create({
          data: {
            postId: post.id,
            authorId: commenter.id,
            content: pick(SAMPLE_COMMENTS, i + c),
          },
        });
      }
    }

    // Recompute from the DB rather than this run's local sets, since a
    // reseed can add commenters/likers left over from a previous run.
    const [likesCount, commentsCount] = await Promise.all([
      prisma.like.count({ where: { postId: post.id } }),
      prisma.comment.count({ where: { postId: post.id } }),
    ]);
    await prisma.post.update({
      where: { id: post.id },
      data: { likesCount, commentsCount },
    });
  }

  console.log(`Seeded ${users.length} sample users (password: "${SAMPLE_PASSWORD}") and ${posts.length} posts.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
