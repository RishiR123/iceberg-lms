/**
 * Creates the "Essence of Linear Algebra" course.
 *
 * Built around 3Blue1Brown's series of the same name (chapters 1–11), embedded
 * and credited — this is a curated path over Grant Sanderson's videos, not
 * original footage. Every video ID was checked against YouTube before being
 * written here.
 *
 * Run:  node --env-file=.env --experimental-strip-types scripts/seed-linear-algebra-course.ts
 */
import { PrismaClient, ActivityType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const COURSE_TITLE = "Essence of Linear Algebra";

const html = (strings: TemplateStringsArray, ...values: unknown[]) =>
  strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), "").trim();

type Q = {
  id: string;
  question: string;
  type: "mcq" | "multiselect" | "tf";
  options: string[];
  correct: number | number[];
  explanation: string;
};
const quiz = (questions: Q[]) => JSON.stringify(questions);

const credit = (chapter: number, title: string, url: string) => html`
  <h2>About this lecture</h2>
  <p>
    This activity embeds <strong>“${title}”</strong> — chapter ${chapter} of
    <strong>3Blue1Brown</strong>'s <em>Essence of Linear Algebra</em>. The video is published on
    YouTube by Grant Sanderson; Iceberg links to it rather than hosting it. Watch it in full, then
    use the notes to lock the intuition in.
  </p>
  <p><a href="${url}" target="_blank" rel="noopener noreferrer">Open the original on YouTube →</a></p>
`;

/** chapter → the one visual idea worth carrying forward, as notes under the video */
const notes: Record<number, string> = {
  1: html`
    <h2>The one idea</h2>
    <p>
      A vector is not really an arrow, and not really a list of numbers — it's whichever of those is
      useful right now, and the whole subject is the dictionary between them. Grounded at the origin,
      an arrow in 2D <em>is</em> a pair of coordinates, and a pair of coordinates <em>is</em> an arrow.
    </p>
    <ul>
      <li><strong>Coordinates</strong> — how far to walk along each axis. The order is the meaning; [3, 1] is not [1, 3].</li>
      <li><strong>Addition</strong> — walk the first, then the second. Tip to tail.</li>
      <li><strong>Scaling</strong> — stretching or squishing a vector; the number you scale by is a “scalar”.</li>
    </ul>
    <p>Everything later is built from just these two moves: adding vectors and scaling them.</p>
  `,
  2: html`
    <h2>The one idea</h2>
    <p>
      Fix two vectors and you can reach a whole plane of points by scaling each and adding — every
      such combination is a <strong>linear combination</strong>, and the full set you can reach is their
      <strong>span</strong>.
    </p>
    <ul>
      <li><strong>Basis</strong> — a set of vectors whose span is the whole space and that don't waste each other.</li>
      <li><strong>Linearly independent</strong> — no vector is a combination of the others; each adds a genuinely new direction.</li>
      <li><strong>Dependent</strong> — one vector already lies in the span of the rest, so it collapses a dimension.</li>
    </ul>
    <p>Coordinates from chapter 1 were secretly linear combinations of the standard basis all along.</p>
  `,
  3: html`
    <h2>The one idea</h2>
    <p>
      A linear transformation moves every point in space, keeping grid lines straight, parallel, and
      evenly spaced, with the origin fixed. The astonishing part: to know where <em>everything</em>
      lands, you only need where the two basis vectors land.
    </p>
    <ul>
      <li><strong>A matrix is those landing spots.</strong> Its columns are where the basis vectors go.</li>
      <li><strong>Matrix–vector multiplication</strong> is just “rebuild the same linear combination at the new basis vectors”.</li>
      <li>Rotations, shears, and scalings are all this same idea with different columns.</li>
    </ul>
    <p>This reframing — matrices as movement, not tables of numbers — is the heart of the whole series.</p>
  `,
  4: html`
    <h2>The one idea</h2>
    <p>
      Multiplying two matrices means doing one transformation and then another. The product is the
      single transformation with the same net effect.
    </p>
    <ul>
      <li><strong>Read right to left</strong> — like function composition, the right-hand matrix acts first.</li>
      <li><strong>Order matters.</strong> Rotating then shearing is not shearing then rotating — AB ≠ BA in general.</li>
      <li><strong>Associativity is free.</strong> (AB)C = A(BC) is obvious once it's “apply these moves in this order”.</li>
    </ul>
  `,
  5: html`
    <h2>The one idea</h2>
    <p>
      Nothing new here, only more room. The same rules carry to 3D: a transformation is fixed by where
      three basis vectors land, and a 3×3 matrix stores those three landing spots as its columns.
    </p>
  `,
  6: html`
    <h2>The one idea</h2>
    <p>
      The <strong>determinant</strong> is the factor by which a transformation scales area (2D) or volume
      (3D). Determinant 3 triples areas; determinant 0 crushes everything onto a line or point.
    </p>
    <ul>
      <li><strong>Zero determinant</strong> — the transformation squashes space into a lower dimension. Remember this; it returns in chapter 7.</li>
      <li><strong>Negative determinant</strong> — space gets flipped over, like turning the plane inside out. The size is still the area factor.</li>
    </ul>
  `,
  7: html`
    <h2>The one idea</h2>
    <p>
      Solving <em>Ax = v</em> asks: which vector x lands on v after the transformation A? The
      <strong>inverse</strong> is the transformation that undoes A, so <em>x = A⁻¹v</em>.
    </p>
    <ul>
      <li><strong>An inverse exists only when det(A) ≠ 0.</strong> If A crushed a dimension, no transformation can un-crush it.</li>
      <li><strong>Column space</strong> — everywhere A can land. Its dimension is the <strong>rank</strong>.</li>
      <li><strong>Null space</strong> — every vector A sends to zero. For a squashing transformation this is more than just the origin.</li>
    </ul>
  `,
  8: html`
    <h2>The one idea</h2>
    <p>
      Matrices needn't be square. A 3×2 matrix takes 2D vectors into 3D; a 2×3 matrix takes 3D into 2D.
      The columns still record where basis vectors land — there are just a different number of them, in a
      space of a different dimension.
    </p>
  `,
  9: html`
    <h2>The one idea</h2>
    <p>
      The <strong>dot product</strong> looks numerical — multiply matching coordinates and add — but it's
      geometry: project one vector onto the other and multiply lengths. Its sign tells you whether two
      vectors point roughly together (+), apart (−), or perpendicular (0).
    </p>
    <p>
      The deep part is <strong>duality</strong>: every vector secretly <em>is</em> a projection-and-scale
      operation, and dotting with it is applying that operation.
    </p>
  `,
  10: html`
    <h2>The one idea</h2>
    <p>
      The <strong>cross product</strong> of two 3D vectors is a new vector: perpendicular to both, with
      length equal to the area of the parallelogram they span, and direction set by the right-hand rule.
    </p>
    <ul>
      <li><strong>That area is a determinant</strong> — chapter 6 again, now as the magnitude of a product.</li>
      <li><strong>Anti-commutative</strong> — a × b = −(b × a); swapping the inputs flips the result.</li>
    </ul>
  `,
  11: html`
    <h2>The one idea</h2>
    <p>
      Why does the cross product formula work? Through duality (chapter 9): the operation “take the
      signed volume of this vector with a and b” is linear, so it <em>is</em> a dot product with some
      fixed vector — and that vector turns out to be exactly a × b.
    </p>
    <p>This is the series folding back on itself: determinant, duality, and the cross product as one idea.</p>
  `,
};

async function main() {
  const existing = await prisma.course.findFirst({ where: { title: COURSE_TITLE } });
  if (existing) {
    console.log(`"${COURSE_TITLE}" already exists (${existing.id}) — nothing to do.`);
    return;
  }

  const course = await prisma.course.create({
    data: {
      title: COURSE_TITLE,
      description:
        "Linear algebra built on geometric intuition rather than symbol-pushing. Follows 3Blue1Brown's celebrated series from vectors to the cross product, so that determinants, matrices and the dot product stop being formulas to memorise and become pictures you can see. Each chapter pairs the video with written notes and a check.",
      thumbnail:
        "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=1200",
      difficulty: "Beginner",
      duration: "8 hours",
      instructor: "Curated path",
      organization: "Iceberg",
      skills:
        "Vectors, Linear Combinations, Span, Basis, Linear Transformations, Matrix Multiplication, Determinants, Inverse Matrices, Column Space, Null Space, Dot Product, Cross Product",
      outcomes:
        "See a vector as both an arrow and a list of coordinates | Explain span, basis and linear independence geometrically | Read a matrix as where the basis vectors land | Interpret matrix multiplication as composed transformations | Explain the determinant as an area/volume scaling factor | Connect an inverse's existence to a non-zero determinant | Describe column space, rank and null space | Interpret the dot product as projection and the cross product as signed area",
      faqs:
        "Do I need prior linear algebra? - No. The series assumes only high-school algebra and builds every idea from pictures. | Will this teach me to compute? - It teaches you to understand — what the computations mean. Pair it with practice problems if you also need fluency crunching numbers by hand. | Who made the videos? - Grant Sanderson, who publishes as 3Blue1Brown, embedded from YouTube with credit. This course curates and sequences the chapters and adds the notes and quizzes. | How is it graded? - Each graded quiz needs 80% to pass. You can retake it as often as you like.",
    },
  });

  // Each chapter → its own module, so the series structure is visible in the sidebar.
  const chapters: { n: number; title: string; videoId: string; dur: string }[] = [
    { n: 1, title: "Vectors", videoId: "fNk_zzaMoSs", dur: "10 mins" },
    { n: 2, title: "Linear combinations, span, and basis vectors", videoId: "k7RM-ot2NWY", dur: "10 mins" },
    { n: 3, title: "Linear transformations and matrices", videoId: "kYB8IZa5AuE", dur: "11 mins" },
    { n: 4, title: "Matrix multiplication as composition", videoId: "XkY2DOUCWMU", dur: "10 mins" },
    { n: 5, title: "Three-dimensional linear transformations", videoId: "rHLEWRxRGiM", dur: "5 mins" },
    { n: 6, title: "The determinant", videoId: "Ip3X9LOh2dk", dur: "10 mins" },
    { n: 7, title: "Inverse matrices, column space and null space", videoId: "uQhTuRlWMxw", dur: "12 mins" },
    { n: 8, title: "Nonsquare matrices as transformations between dimensions", videoId: "v8VSDg_WQlA", dur: "4 mins" },
    { n: 9, title: "Dot products and duality", videoId: "LyGKycYT2v0", dur: "14 mins" },
    { n: 10, title: "Cross products", videoId: "eu6i7WJeinw", dur: "9 mins" },
    { n: 11, title: "Cross products in the light of linear transformations", videoId: "BaM7OCEm3G0", dur: "14 mins" },
  ];

  const quizzes: Record<number, Q[]> = {
    2: [
      {
        id: "c2q1",
        question: "What is the span of a set of vectors?",
        type: "mcq",
        options: [
          "Their total length added together",
          "The set of all points reachable by scaling and adding them",
          "The angle between them",
          "The number of vectors in the set",
        ],
        correct: 1,
        explanation:
          "The span is every linear combination — every point you can reach by scaling each vector and adding the results.",
      },
      {
        id: "c2q2",
        question: "Two vectors are linearly dependent when…",
        type: "mcq",
        options: [
          "they point in exactly opposite directions",
          "one lies on the line through the other, so it adds no new direction",
          "their coordinates are all positive",
          "they are perpendicular",
        ],
        correct: 1,
        explanation:
          "Dependent means one is already a scaled copy of the other (a linear combination of the rest), so it collapses rather than extends the span.",
      },
      {
        id: "c2q3",
        question: "A basis for a 2D plane must be two linearly independent vectors.",
        type: "tf",
        options: ["True", "False"],
        correct: 0,
        explanation:
          "A basis spans the space and is independent. In 2D that's exactly two independent vectors — enough to reach everywhere, with none wasted.",
      },
    ],
    3: [
      {
        id: "c3q1",
        question: "Where do you read where the basis vectors land after a transformation?",
        type: "mcq",
        options: [
          "In the rows of the matrix",
          "In the columns of the matrix",
          "In the determinant",
          "On the diagonal only",
        ],
        correct: 1,
        explanation:
          "The columns of the matrix are the coordinates of where each basis vector lands. That's the whole meaning of the matrix.",
      },
      {
        id: "c3q2",
        question: "What must a linear transformation preserve?",
        type: "multiselect",
        options: [
          "Grid lines stay straight and parallel",
          "The origin stays fixed",
          "All distances stay exactly the same",
          "Evenly spaced lines stay evenly spaced",
        ],
        correct: [0, 1, 3],
        explanation:
          "Linear means straight, parallel, evenly-spaced grid lines with a fixed origin. Distances are NOT preserved in general — scalings and shears change them.",
      },
      {
        id: "c3q3",
        question:
          "The matrix with columns [1,0] and [0,1] (the identity) leaves every vector unchanged.",
        type: "tf",
        options: ["True", "False"],
        correct: 0,
        explanation:
          "Its columns say the basis vectors land exactly on themselves, so nothing moves — that's the identity transformation.",
      },
    ],
    4: [
      {
        id: "c4q1",
        question: "The matrix product AB represents…",
        type: "mcq",
        options: [
          "applying A, then applying B",
          "applying B first, then A",
          "adding the two transformations",
          "the larger of the two transformations",
        ],
        correct: 1,
        explanation:
          "Like function composition, you read right to left: B acts first, then A. That's why the order is what it is.",
      },
      {
        id: "c4q2",
        question: "For general matrices, AB equals BA.",
        type: "tf",
        options: ["True", "False"],
        correct: 1,
        explanation:
          "False. Order matters: a rotation then a shear differs from a shear then a rotation. Matrix multiplication is not commutative.",
      },
    ],
    6: [
      {
        id: "c6q1",
        question: "What does the determinant of a transformation measure?",
        type: "mcq",
        options: [
          "The angle it rotates by",
          "The factor by which it scales areas (or volumes)",
          "The number of dimensions",
          "The length of the longest basis vector",
        ],
        correct: 1,
        explanation:
          "The determinant is the area (2D) or volume (3D) scaling factor. Determinant 3 triples areas.",
      },
      {
        id: "c6q2",
        question: "A determinant of zero means…",
        type: "mcq",
        options: [
          "the transformation is a pure rotation",
          "space is squashed into a lower dimension (a line or point)",
          "the transformation does nothing",
          "areas are doubled",
        ],
        correct: 1,
        explanation:
          "Zero area-factor means everything is crushed onto a line or point — a dimension is lost. This is exactly why such a transformation can't be inverted.",
      },
      {
        id: "c6q3",
        question: "A negative determinant means the transformation flips the orientation of space.",
        type: "tf",
        options: ["True", "False"],
        correct: 0,
        explanation:
          "True. The sign records orientation — negative means space was flipped over — while the magnitude is still the area/volume factor.",
      },
    ],
    7: [
      {
        id: "c7q1",
        question: "An inverse matrix A⁻¹ exists precisely when…",
        type: "mcq",
        options: [
          "the determinant of A is zero",
          "the determinant of A is non-zero",
          "A is a rotation",
          "A has only positive entries",
        ],
        correct: 1,
        explanation:
          "A non-zero determinant means no dimension was crushed, so the transformation can be undone. Zero determinant → no inverse.",
      },
      {
        id: "c7q2",
        question: "The null space of a matrix is…",
        type: "mcq",
        options: [
          "the set of vectors it sends to the zero vector",
          "everywhere the transformation can land",
          "the vectors left unchanged",
          "the diagonal entries",
        ],
        correct: 0,
        explanation:
          "The null space is every input mapped to zero. For a space-squashing transformation it's more than just the origin.",
      },
      {
        id: "c7q3",
        question: "The column space of a matrix is the set of all possible outputs of the transformation.",
        type: "tf",
        options: ["True", "False"],
        correct: 0,
        explanation:
          "True. The column space is everywhere the transformation can land, and its dimension is the rank.",
      },
    ],
    9: [
      {
        id: "c9q1",
        question: "Geometrically, the dot product of two vectors is…",
        type: "mcq",
        options: [
          "the area of the parallelogram they form",
          "the length of one projected onto the other, times that other's length",
          "always zero",
          "the angle between them in degrees",
        ],
        correct: 1,
        explanation:
          "Project one vector onto the other and multiply lengths. That projection view is what makes the dot product geometric rather than just arithmetic.",
      },
      {
        id: "c9q2",
        question: "If two vectors' dot product is zero, they are…",
        type: "mcq",
        options: ["parallel", "perpendicular", "identical", "opposite"],
        correct: 1,
        explanation:
          "Zero projection means no shared direction — the vectors meet at a right angle.",
      },
      {
        id: "c9q3",
        question: "A negative dot product means the two vectors point generally in opposite directions.",
        type: "tf",
        options: ["True", "False"],
        correct: 0,
        explanation:
          "True. Positive means roughly together, zero means perpendicular, negative means roughly apart.",
      },
    ],
    11: [
      {
        id: "c11q1",
        question: "The cross product a × b produces a vector that is…",
        type: "mcq",
        options: [
          "perpendicular to both a and b, with length equal to the parallelogram's area",
          "parallel to a",
          "the sum of a and b",
          "always the zero vector",
        ],
        correct: 0,
        explanation:
          "It's perpendicular to both, its length is the spanned parallelogram's area (a determinant), and the right-hand rule sets its direction.",
      },
      {
        id: "c11q2",
        question: "How does swapping the order change a cross product?",
        type: "mcq",
        options: [
          "It stays the same",
          "It flips sign: a × b = −(b × a)",
          "It becomes zero",
          "It doubles in length",
        ],
        correct: 1,
        explanation:
          "The cross product is anti-commutative — swapping inputs reverses the result's direction.",
      },
      {
        id: "c11q3",
        question:
          "Chapter 11 explains the cross product formula using duality — the same idea behind the dot product.",
        type: "tf",
        options: ["True", "False"],
        correct: 0,
        explanation:
          "True. A linear 'signed volume' operation must be a dot product with some fixed vector, and that vector is exactly a × b. The series folds back on itself.",
      },
    ],
  };

  let activityCount = 0;

  for (const ch of chapters) {
    const mod = await prisma.module.create({
      data: {
        courseId: course.id,
        order: ch.n,
        title: `Chapter ${ch.n} — ${ch.title}`,
        description: notes[ch.n] ? undefined : undefined,
      },
    });

    // Video lesson (the chapter itself)
    await prisma.activity.create({
      data: {
        moduleId: mod.id,
        order: 1,
        type: ActivityType.VIDEO,
        title: ch.title,
        duration: ch.dur,
        completionRule: "MANUAL",
        videoUrl: `https://www.youtube.com/watch?v=${ch.videoId}`,
        content: credit(ch.n, `${ch.title} | Chapter ${ch.n}, Essence of linear algebra`, `https://www.youtube.com/watch?v=${ch.videoId}`) + (notes[ch.n] ?? ""),
      },
    });
    activityCount++;

    // A graded check on the chapters that carry a testable idea.
    if (quizzes[ch.n]) {
      await prisma.activity.create({
        data: {
          moduleId: mod.id,
          order: 2,
          type: ActivityType.QUIZ,
          title: `Check: ${ch.title}`,
          duration: "5 mins",
          completionRule: "SCORE_80",
          content: quiz(quizzes[ch.n]),
        },
      });
      activityCount++;
    }
  }

  // A closing discussion for the whole series.
  const finale = await prisma.module.findFirst({
    where: { courseId: course.id, order: 11 },
  });
  if (finale) {
    await prisma.activity.create({
      data: {
        moduleId: finale.id,
        order: 3,
        type: ActivityType.DISCUSSION,
        title: "Discussion: which picture stuck?",
        duration: "10 mins",
        completionRule: "MANUAL",
        content: html`
          <h2>Look back across the series</h2>
          <p>Post a short reply on one of these — and respond to someone else's:</p>
          <ul>
            <li>
              <strong>The reframing that landed.</strong> Which idea did this change for you —
              matrices as movement, the determinant as area, the dot product as projection? What did you
              picture <em>before</em>?
            </li>
            <li>
              <strong>The thread you noticed.</strong> The determinant shows up in chapters 6, 7, 10 and
              11. Where did you feel the series folding back on itself?
            </li>
            <li>
              <strong>Where you'd use it.</strong> Graphics, data, physics, ML — where would seeing these
              transformations geometrically help you?
            </li>
          </ul>
        `,
      },
    });
    activityCount++;
  }

  console.log(`Created "${course.title}" (${course.id})`);
  console.log(`  ${chapters.length} chapters, ${activityCount} activities`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
