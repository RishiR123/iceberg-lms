/**
 * Creates the "Machine Learning Foundations" course.
 *
 * The videos are third-party lectures from StatQuest and 3Blue1Brown, embedded
 * and credited — this course is a curated path over them, not original footage.
 * Every video ID here was checked against YouTube before being written down.
 *
 * Run:  node --env-file=.env --experimental-strip-types scripts/seed-ml-course.ts
 */
import { PrismaClient, ActivityType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const COURSE_TITLE = "Machine Learning Foundations";

/** Small helper so reading content stays readable in source. */
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

const credit = (title: string, channel: string, url: string) => html`
  <h2>About this lecture</h2>
  <p>
    This activity embeds <strong>“${title}”</strong> by <strong>${channel}</strong>. The video is
    published on YouTube by its creator; Iceberg links to it rather than hosting it.
    Watch it in full, then use the notes below to consolidate.
  </p>
  <p><a href="${url}" target="_blank" rel="noopener noreferrer">Open the original on YouTube →</a></p>
`;

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
        "A curated path through the fundamentals of machine learning: how models learn from data, how to tell a good model from a bad one, and how the classic algorithms actually work. Built around the clearest public lectures available, with written notes and graded checks at every step.",
      thumbnail:
        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=1200",
      difficulty: "Beginner",
      duration: "12 hours",
      instructor: "Curated path",
      organization: "Iceberg",
      skills:
        "Supervised Learning, Linear Regression, Logistic Regression, Gradient Descent, Model Evaluation, Cross Validation, Decision Trees, Random Forests, Neural Networks",
      outcomes:
        "Explain what it means for a model to learn from data | Fit and interpret linear and logistic regression | Describe how gradient descent minimises a loss function | Diagnose overfitting and underfitting using the bias-variance tradeoff | Evaluate models honestly with cross validation and the right metric | Explain how decision trees split data and why random forests beat single trees | Describe the structure of a neural network and how backpropagation trains it",
      faqs:
        "Do I need to know calculus? - No. You need comfort with basic algebra and graphs. The lectures build intuition first; where calculus appears, it is explained visually. | Do I need to code? - Not to complete this course. It focuses on understanding. You will get far more out of it if you experiment in Python alongside, but nothing here is graded on code. | Who made the videos? - The lectures are by StatQuest (Josh Starmer) and 3Blue1Brown (Grant Sanderson), embedded from YouTube with credit. This course curates and sequences them, adds written notes, and adds the quizzes. | How is the course graded? - Each graded quiz needs 80% to pass. Practice quizzes only need an attempt. You can retake anything as often as you like.",
    },
  });

  // ── Module 1 ──────────────────────────────────────────────────────────────
  const m1 = await prisma.module.create({
    data: {
      courseId: course.id,
      order: 1,
      title: "Module 1 — How a Model Learns",
      description: "What machine learning is, and the two ideas underneath almost all of it: a loss function and gradient descent.",
    },
  });

  await prisma.activity.createMany({
    data: [
      {
        moduleId: m1.id,
        order: 1,
        type: ActivityType.READING,
        title: "What machine learning actually is",
        duration: "15 mins",
        completionRule: "MANUAL",
        content: html`
          <h2>1. The shift in thinking</h2>
          <p>
            In ordinary programming you write the rules and the computer applies them. You decide
            that an email is spam if it contains “free money”, and you code that rule. In machine
            learning you invert this: you supply <em>examples</em> — thousands of emails already
            labelled spam or not — and the computer works out the rules itself.
          </p>
          <p>
            That inversion is the whole idea. You are not programming behaviour; you are programming
            a process that <em>discovers</em> behaviour from data.
          </p>

          <h2>2. The three ingredients</h2>
          <p>Every supervised learning setup has exactly three parts:</p>
          <ul>
            <li><strong>A model</strong> — a family of possible rules with adjustable knobs. For a straight line, the knobs are slope and intercept.</li>
            <li><strong>A loss function</strong> — a single number saying how wrong the model currently is. Lower is better.</li>
            <li><strong>An optimiser</strong> — a procedure that turns the knobs to make the loss smaller.</li>
          </ul>
          <p>
            Change the model and you get a different algorithm. Change the loss and you change what
            “good” means. Nearly every method in this course is a different choice of those three.
          </p>

          <h2>3. Supervised vs unsupervised</h2>
          <p>
            <strong>Supervised</strong> learning has labelled examples: each input comes with the
            right answer. Predicting a house price from its size is supervised — you have historical
            sales with actual prices. This course is almost entirely supervised.
          </p>
          <p>
            <strong>Unsupervised</strong> learning has no labels. You give the algorithm data and ask
            it to find structure — grouping customers by behaviour, say, without being told what the
            groups are.
          </p>

          <h2>4. Regression vs classification</h2>
          <p>Within supervised learning, the split is about what you predict:</p>
          <ul>
            <li><strong>Regression</strong> predicts a number. How much will this house sell for?</li>
            <li><strong>Classification</strong> predicts a category. Is this email spam?</li>
          </ul>
          <p>
            Module 1 covers regression. Module 2 moves to classification. They share the same
            three-part skeleton — only the model and the loss change.
          </p>

          <h2>5. The one rule that matters most</h2>
          <p>
            A model's score on the data it learned from is close to meaningless. Anything can
            memorise. What matters is performance on data it has <em>never seen</em>. That single
            idea — generalisation — is what Module 2 is really about, and it's where most real
            projects go wrong.
          </p>
        `,
      },
      {
        moduleId: m1.id,
        order: 2,
        type: ActivityType.VIDEO,
        title: "Linear regression, clearly explained",
        duration: "27 mins",
        completionRule: "MANUAL",
        videoUrl: "https://www.youtube.com/watch?v=nk2CQITm_eo",
        content:
          credit("Linear Regression, Clearly Explained!!!", "StatQuest with Josh Starmer", "https://www.youtube.com/watch?v=nk2CQITm_eo") +
          html`
            <h2>What to take away</h2>
            <p>
              Linear regression fits the straight line that minimises the sum of squared residuals —
              the vertical gaps between each point and the line. Squaring matters: it makes every
              error positive, and it punishes one big miss far more than several small ones.
            </p>
            <ul>
              <li><strong>Residual</strong> — the gap between what actually happened and what the line predicted.</li>
              <li><strong>Least squares</strong> — the choice of slope and intercept that makes the total squared residual as small as possible.</li>
              <li><strong>R²</strong> — the share of the variation in the outcome the line accounts for. R² = 0.7 means the line explains 70% of the variance; the rest is unexplained.</li>
              <li><strong>p-value</strong> — whether the relationship is distinguishable from noise. A high R² with a bad p-value on tiny data is not a finding.</li>
            </ul>
            <p>
              Watch for the moment the residuals are squared and summed. That sum <em>is</em> the loss
              function from the previous reading — the number the model is trying to push down.
            </p>
          `,
      },
      {
        moduleId: m1.id,
        order: 3,
        type: ActivityType.VIDEO,
        title: "Gradient descent, step by step",
        duration: "23 mins",
        completionRule: "MANUAL",
        videoUrl: "https://www.youtube.com/watch?v=sDv4f4s2SB8",
        content:
          credit("Gradient Descent, Step-by-Step", "StatQuest with Josh Starmer", "https://www.youtube.com/watch?v=sDv4f4s2SB8") +
          html`
            <h2>What to take away</h2>
            <p>
              Linear regression has a formula that jumps straight to the answer. Almost nothing else
              does. Gradient descent is the general procedure that trains the rest — including every
              neural network you have ever heard of.
            </p>
            <p>The loop is short enough to memorise:</p>
            <ol>
              <li>Start with a guess for the parameters.</li>
              <li>Work out the slope (gradient) of the loss at that guess.</li>
              <li>Take a step <em>downhill</em> — opposite the gradient.</li>
              <li>Repeat until the steps stop changing anything.</li>
            </ol>
            <ul>
              <li><strong>Learning rate</strong> — the step size. Too small and training crawls; too large and it overshoots the minimum and can diverge entirely.</li>
              <li><strong>Steps shrink automatically</strong> — the gradient flattens near the bottom, so the same rule takes big strides when far away and tiptoes when close.</li>
              <li><strong>Stochastic gradient descent</strong> — uses a random subset each step instead of all the data. Noisier per step, but far faster when data is large.</li>
            </ul>
          `,
      },
      {
        moduleId: m1.id,
        order: 4,
        type: ActivityType.PRACTICE_QUIZ,
        title: "Practice: the learning loop",
        duration: "5 mins",
        completionRule: "ATTEMPT",
        content: quiz([
          {
            id: "m1p1",
            question: "In the three-part skeleton, what is the job of the loss function?",
            type: "mcq",
            options: [
              "To adjust the model's parameters",
              "To report, as a single number, how wrong the model currently is",
              "To split the data into training and test sets",
              "To decide whether the problem is regression or classification",
            ],
            correct: 1,
            explanation:
              "The loss only measures wrongness. Adjusting parameters is the optimiser's job — the two work together but are separate pieces.",
          },
          {
            id: "m1p2",
            question: "Which of these are regression problems?",
            type: "multiselect",
            options: [
              "Predicting tomorrow's temperature in °C",
              "Deciding whether a transaction is fraudulent",
              "Estimating how many minutes a delivery will take",
              "Tagging a photo as cat or dog",
            ],
            correct: [0, 2],
            explanation:
              "Regression predicts a number: temperature and minutes. Fraud and cat/dog are categories, so they're classification.",
          },
          {
            id: "m1p3",
            question: "A very large learning rate always makes training finish faster.",
            type: "tf",
            options: ["True", "False"],
            correct: 1,
            explanation:
              "False. Too large a step overshoots the minimum and can bounce outward, so the loss grows instead of shrinking — training may never converge.",
          },
        ]),
      },
      {
        moduleId: m1.id,
        order: 5,
        type: ActivityType.QUIZ,
        title: "Graded quiz: how a model learns",
        duration: "10 mins",
        completionRule: "SCORE_80",
        content: quiz([
          {
            id: "m1q1",
            question: "Why does least squares square the residuals rather than just adding them up?",
            type: "mcq",
            options: [
              "Squaring makes the arithmetic faster to compute",
              "It makes every error positive so they can't cancel out, and penalises large misses disproportionately",
              "It guarantees R² is always above 0.5",
              "It converts the problem from regression into classification",
            ],
            correct: 1,
            explanation:
              "Without squaring, a residual of +5 and one of −5 would cancel to zero and a terrible line would look perfect. Squaring also means one big miss hurts more than several small ones.",
          },
          {
            id: "m1q2",
            question: "An R² of 0.7 tells you what?",
            type: "mcq",
            options: [
              "70% of predictions are exactly correct",
              "The model will be right 70% of the time on new data",
              "The model accounts for 70% of the variation in the outcome",
              "There is a 70% chance the relationship is real",
            ],
            correct: 2,
            explanation:
              "R² is the share of variance explained. It says nothing directly about accuracy on new data, and it is not a probability that the finding is real — that's what the p-value speaks to.",
          },
          {
            id: "m1q3",
            question: "Which steps make up one iteration of gradient descent?",
            type: "multiselect",
            options: [
              "Compute the gradient of the loss at the current parameters",
              "Take a step in the direction opposite the gradient",
              "Re-label the training data",
              "Scale the step by the learning rate",
            ],
            correct: [0, 1, 3],
            explanation:
              "Gradient, step downhill, scaled by the learning rate. Labels are fixed — training never rewrites its own ground truth.",
          },
          {
            id: "m1q4",
            question: "Gradient descent steps naturally get smaller as it approaches a minimum, even with a fixed learning rate.",
            type: "tf",
            options: ["True", "False"],
            correct: 0,
            explanation:
              "True. The step is proportional to the gradient, and the loss surface flattens near a minimum, so the gradient shrinks and the steps shrink with it.",
          },
          {
            id: "m1q5",
            question: "A model scores 99% on the exact data it was trained on. What can you conclude?",
            type: "mcq",
            options: [
              "It is an excellent model",
              "Almost nothing — memorising training data is easy; only unseen data tells you anything",
              "It has definitely underfit",
              "Its learning rate was ideal",
            ],
            correct: 1,
            explanation:
              "Training accuracy is close to meaningless on its own. A model that memorises every example scores perfectly and may generalise terribly. This is exactly what Module 2 addresses.",
          },
        ]),
      },
    ],
  });

  // ── Module 2 ──────────────────────────────────────────────────────────────
  const m2 = await prisma.module.create({
    data: {
      courseId: course.id,
      order: 2,
      title: "Module 2 — Classification & Honest Evaluation",
      description: "Predicting categories, and the harder problem: knowing whether your model is actually any good.",
    },
  });

  await prisma.activity.createMany({
    data: [
      {
        moduleId: m2.id,
        order: 1,
        type: ActivityType.VIDEO,
        title: "Logistic regression",
        duration: "9 mins",
        completionRule: "MANUAL",
        videoUrl: "https://www.youtube.com/watch?v=yIYKR4sgzI8",
        content:
          credit("StatQuest: Logistic Regression", "StatQuest with Josh Starmer", "https://www.youtube.com/watch?v=yIYKR4sgzI8") +
          html`
            <h2>What to take away</h2>
            <p>
              Despite the name, logistic regression is a <em>classifier</em>. It predicts the
              probability that something belongs to a class, then you threshold that probability to
              make a decision.
            </p>
            <ul>
              <li><strong>Why not a straight line?</strong> A line is unbounded — it happily predicts a probability of 1.4 or −0.3, which is nonsense.</li>
              <li><strong>The sigmoid</strong> squashes any number onto the range 0–1, so the output can be read as a probability.</li>
              <li><strong>The threshold is a choice, not a fact.</strong> 0.5 is a default, not a law. For cancer screening you might act at 0.1, accepting false alarms to avoid missing a case.</li>
            </ul>
            <p>
              The three-part skeleton still holds: the model is the sigmoid of a linear combination,
              the loss is log-loss instead of squared error, and the optimiser is gradient descent.
            </p>
          `,
      },
      {
        moduleId: m2.id,
        order: 2,
        type: ActivityType.READING,
        title: "Judging a classifier: the metric is a decision",
        duration: "20 mins",
        completionRule: "MANUAL",
        content: html`
          <h2>1. Why accuracy lies</h2>
          <p>
            Imagine a disease affecting 1 in 1,000 people. A model that always says “healthy” is
            99.9% accurate — and completely useless. It catches nobody. Whenever classes are
            imbalanced, accuracy flatters models that do nothing.
          </p>

          <h2>2. The four outcomes</h2>
          <p>Every prediction on a yes/no problem lands in one of four boxes:</p>
          <ul>
            <li><strong>True positive</strong> — predicted yes, was yes.</li>
            <li><strong>False positive</strong> — predicted yes, was no. A false alarm.</li>
            <li><strong>True negative</strong> — predicted no, was no.</li>
            <li><strong>False negative</strong> — predicted no, was yes. A miss.</li>
          </ul>
          <p>Arranged in a 2×2 grid, this is the <strong>confusion matrix</strong>, and every metric below is just a ratio drawn from it.</p>

          <h2>3. Precision and recall</h2>
          <ul>
            <li><strong>Precision</strong> — of everything you flagged, what share was right? <em>TP / (TP + FP)</em>. Low precision means crying wolf.</li>
            <li><strong>Recall</strong> — of everything that truly was positive, what share did you catch? <em>TP / (TP + FN)</em>. Low recall means missing real cases.</li>
          </ul>
          <p>
            They trade off. Lower your threshold and you catch more real cases (recall up) but raise
            more false alarms (precision down). You cannot maximise both; you must decide which error
            is worse <em>in your situation</em>.
          </p>
          <p>
            <strong>Spam filter:</strong> a false positive buries a real email — precision matters more.
            <strong>Cancer screening:</strong> a false negative sends a sick patient home — recall matters more.
            The metric encodes a value judgement about which mistake you can live with.
          </p>

          <h2>4. F1</h2>
          <p>
            F1 is the harmonic mean of precision and recall — a single number when you care about both
            roughly equally. The harmonic mean punishes imbalance: 1.0 precision with 0.0 recall gives
            F1 = 0, not 0.5. It's a summary, not a substitute for deciding which error hurts.
          </p>

          <h2>5. The rule you cannot break</h2>
          <p>
            Every one of these numbers must be computed on data the model has never seen. Measured on
            training data they only tell you how well it memorised. Which brings us to cross validation.
          </p>
        `,
      },
      {
        moduleId: m2.id,
        order: 3,
        type: ActivityType.VIDEO,
        title: "Bias and variance",
        duration: "6 mins",
        completionRule: "MANUAL",
        videoUrl: "https://www.youtube.com/watch?v=EuBBz3bI-aA",
        content:
          credit("Machine Learning Fundamentals: Bias and Variance", "StatQuest with Josh Starmer", "https://www.youtube.com/watch?v=EuBBz3bI-aA") +
          html`
            <h2>What to take away</h2>
            <p>This is the single most useful diagnostic in applied machine learning.</p>
            <ul>
              <li><strong>Bias</strong> — error from the model being too simple to capture the real pattern. A straight line through a curve. Symptom: it does badly on training data <em>and</em> test data. This is <strong>underfitting</strong>.</li>
              <li><strong>Variance</strong> — error from the model being so flexible it chases noise. Symptom: near-perfect on training data, poor on test data. This is <strong>overfitting</strong>.</li>
            </ul>
            <p>
              The gap between training and test performance is your instrument. Small gap, both bad →
              high bias, use a richer model. Huge gap → high variance, simplify, regularise, or get more
              data. Both errors low → you're done.
            </p>
            <p>
              This is why the previous reading insisted on unseen data. Without a test set you cannot
              see the gap, and without the gap you are flying blind.
            </p>
          `,
      },
      {
        moduleId: m2.id,
        order: 4,
        type: ActivityType.VIDEO,
        title: "Cross validation",
        duration: "6 mins",
        completionRule: "MANUAL",
        videoUrl: "https://www.youtube.com/watch?v=fSytzGwwBVw",
        content:
          credit("Machine Learning Fundamentals: Cross Validation", "StatQuest with Josh Starmer", "https://www.youtube.com/watch?v=fSytzGwwBVw") +
          html`
            <h2>What to take away</h2>
            <p>
              One train/test split gives one number — and that number depends on which rows happened to
              land in the test set. Get unlucky and you'll draw the wrong conclusion.
            </p>
            <p>
              <strong>k-fold cross validation</strong> fixes this: split the data into k blocks, train on
              k−1 and test on the one left out, and rotate until every block has been the test set once.
              Now every row is used for both training and testing — never at the same time — and you get k
              scores instead of one.
            </p>
            <ul>
              <li><strong>The spread matters as much as the mean.</strong> Scores of 0.79/0.81/0.80 mean something very different from 0.55/0.95/0.90 with the same average.</li>
              <li><strong>Use it to choose.</strong> Cross validation is how you pick between models or settings without burning your final test set.</li>
              <li><strong>Keep a holdout.</strong> Once you've used cross validation to make choices, it has informed those choices — a truly untouched test set is still the honest final check.</li>
            </ul>
          `,
      },
      {
        moduleId: m2.id,
        order: 5,
        type: ActivityType.QUIZ,
        title: "Graded quiz: classification & evaluation",
        duration: "12 mins",
        completionRule: "SCORE_80",
        content: quiz([
          {
            id: "m2q1",
            question: "Why is a linear model a poor fit for predicting probabilities?",
            type: "mcq",
            options: [
              "It trains too slowly on large datasets",
              "Its output is unbounded, so it predicts impossible probabilities below 0 and above 1",
              "It cannot be trained with gradient descent",
              "It requires the classes to be perfectly balanced",
            ],
            correct: 1,
            explanation:
              "A straight line runs to ±infinity. Probabilities live strictly in [0, 1], which is exactly what the sigmoid enforces.",
          },
          {
            id: "m2q2",
            question:
              "A fraud model flags 100 transactions. 30 are truly fraudulent. There were 60 frauds in total. What are precision and recall?",
            type: "mcq",
            options: [
              "Precision 0.30, recall 0.50",
              "Precision 0.50, recall 0.30",
              "Precision 0.30, recall 0.60",
              "Precision 0.60, recall 0.30",
            ],
            correct: 0,
            explanation:
              "Precision = 30 correct out of 100 flagged = 0.30. Recall = 30 caught out of 60 real frauds = 0.50.",
          },
          {
            id: "m2q3",
            question:
              "A model scores 99% on training data and 62% on test data. What is the diagnosis?",
            type: "mcq",
            options: [
              "High bias — the model is underfitting",
              "High variance — the model is overfitting",
              "The learning rate is too small",
              "The test set is mislabelled",
            ],
            correct: 1,
            explanation:
              "A large train/test gap is the signature of overfitting: the model has memorised noise it can't reproduce on unseen data. Underfitting would show poor scores on both.",
          },
          {
            id: "m2q4",
            question: "For a screening test where missing a sick patient is far worse than a false alarm, which should you prioritise?",
            type: "mcq",
            options: [
              "Precision, and raise the decision threshold",
              "Recall, and lower the decision threshold",
              "Raw accuracy",
              "Training-set accuracy",
            ],
            correct: 1,
            explanation:
              "Missing a case is a false negative, which recall measures. Lowering the threshold flags more people — catching more real cases at the cost of more false alarms, a trade worth making here.",
          },
          {
            id: "m2q5",
            question: "Which statements about k-fold cross validation are true?",
            type: "multiselect",
            options: [
              "Every observation is used for testing exactly once",
              "It produces several scores, so you can see the spread and not just the average",
              "It lets you evaluate on the training data safely",
              "It reduces the chance that your result is an artefact of one lucky split",
            ],
            correct: [0, 1, 3],
            explanation:
              "Cross validation rotates the test fold so every row is tested once, yields k scores, and removes the luck of a single split. It never makes evaluating on training data valid — each fold is still scored on data held out from that fold's training.",
          },
          {
            id: "m2q6",
            question: "On a dataset where 99.9% of cases are negative, a model with 99.9% accuracy is necessarily useful.",
            type: "tf",
            options: ["True", "False"],
            correct: 1,
            explanation:
              "False. Always predicting the majority class achieves exactly that accuracy while catching nothing. On imbalanced data, accuracy is actively misleading — use precision and recall.",
          },
        ]),
      },
    ],
  });

  // ── Module 3 ──────────────────────────────────────────────────────────────
  const m3 = await prisma.module.create({
    data: {
      courseId: course.id,
      order: 3,
      title: "Module 3 — Trees & Ensembles",
      description: "Models that ask questions instead of drawing lines — and why a crowd of weak trees beats one clever one.",
    },
  });

  await prisma.activity.createMany({
    data: [
      {
        moduleId: m3.id,
        order: 1,
        type: ActivityType.VIDEO,
        title: "Decision and classification trees",
        duration: "18 mins",
        completionRule: "MANUAL",
        videoUrl: "https://www.youtube.com/watch?v=_L39rN6gz7Y",
        content:
          credit("Decision and Classification Trees, Clearly Explained!!!", "StatQuest with Josh Starmer", "https://www.youtube.com/watch?v=_L39rN6gz7Y") +
          html`
            <h2>What to take away</h2>
            <p>
              A decision tree is a flowchart the algorithm writes for you. Each node asks a yes/no
              question about one feature; each leaf gives an answer.
            </p>
            <ul>
              <li><strong>Choosing the split</strong> — try every feature and threshold, keep whichever leaves the groups purest.</li>
              <li><strong>Gini impurity</strong> — the measure of “mixed-up-ness”. 0 means a leaf is entirely one class. The split that lowers total impurity most wins.</li>
              <li><strong>Greedy</strong> — it takes the best split available right now, never backtracking. Fast, and not guaranteed optimal overall.</li>
              <li><strong>Overfitting</strong> — left unchecked a tree grows until every leaf is one training row. Perfect on training data, useless on new data. Textbook high variance.</li>
            </ul>
            <p>
              Trees are the most interpretable model here — you can read the rules aloud. That's why
              they're used where a decision must be explained.
            </p>
          `,
      },
      {
        moduleId: m3.id,
        order: 2,
        type: ActivityType.VIDEO,
        title: "Random forests: building and evaluating",
        duration: "10 mins",
        completionRule: "MANUAL",
        videoUrl: "https://www.youtube.com/watch?v=J4Wdy0Wc_xQ",
        content:
          credit("StatQuest: Random Forests Part 1 - Building, Using and Evaluating", "StatQuest with Josh Starmer", "https://www.youtube.com/watch?v=J4Wdy0Wc_xQ") +
          html`
            <h2>What to take away</h2>
            <p>
              One deep tree overfits. A random forest builds hundreds of deliberately varied trees and
              lets them vote. The errors are largely independent, so they cancel; the signal doesn't.
            </p>
            <ul>
              <li><strong>Bootstrapping</strong> — each tree trains on a random sample drawn with replacement, so no two trees see quite the same data.</li>
              <li><strong>Random feature subsets</strong> — at each split only a random handful of features is considered, which stops every tree from keying on the same dominant feature.</li>
              <li><strong>Voting</strong> — classification takes the majority; regression takes the mean.</li>
              <li><strong>Out-of-bag error</strong> — roughly a third of rows are left out of each tree's sample, giving a free validation estimate without a separate split.</li>
            </ul>
            <p>
              Note the trade: you gained accuracy and lost the tree's readability. You can no longer
              point at a flowchart and explain the decision — a real cost in regulated settings.
            </p>
          `,
      },
      {
        moduleId: m3.id,
        order: 3,
        type: ActivityType.PRACTICE_QUIZ,
        title: "Practice: trees and forests",
        duration: "5 mins",
        completionRule: "ATTEMPT",
        content: quiz([
          {
            id: "m3p1",
            question: "What does a Gini impurity of 0 at a leaf mean?",
            type: "mcq",
            options: [
              "The leaf contains no training examples",
              "Every example in that leaf belongs to the same class",
              "The split was chosen at random",
              "The tree has finished training",
            ],
            correct: 1,
            explanation: "Impurity measures how mixed a group is. Zero means perfectly pure — one class only.",
          },
          {
            id: "m3p2",
            question: "What makes the trees in a random forest different from one another?",
            type: "multiselect",
            options: [
              "Each trains on a bootstrapped sample of the rows",
              "Each considers only a random subset of features at each split",
              "Each uses a different learning rate",
              "Each is trained on a different label set",
            ],
            correct: [0, 1],
            explanation:
              "Variety comes from bootstrapped rows and random feature subsets. Trees have no learning rate, and the labels never change.",
          },
          {
            id: "m3p3",
            question: "A random forest is easier to explain to a regulator than a single decision tree.",
            type: "tf",
            options: ["True", "False"],
            correct: 1,
            explanation:
              "False, and it's the main trade-off. A single tree is a readable flowchart; a forest is hundreds of them voting, which is far harder to justify decision-by-decision.",
          },
        ]),
      },
    ],
  });

  // ── Module 4 ──────────────────────────────────────────────────────────────
  const m4 = await prisma.module.create({
    data: {
      courseId: course.id,
      order: 4,
      title: "Module 4 — Neural Networks",
      description: "What a network actually computes, and how backpropagation trains it. The same three ingredients, scaled up.",
    },
  });

  await prisma.activity.createMany({
    data: [
      {
        moduleId: m4.id,
        order: 1,
        type: ActivityType.VIDEO,
        title: "But what is a neural network?",
        duration: "19 mins",
        completionRule: "MANUAL",
        videoUrl: "https://www.youtube.com/watch?v=aircAruvnKk",
        content:
          credit("But what is a neural network? | Deep learning chapter 1", "3Blue1Brown", "https://www.youtube.com/watch?v=aircAruvnKk") +
          html`
            <h2>What to take away</h2>
            <p>
              Strip away the biology metaphor and a neural network is a large nested function with a
              great many adjustable numbers.
            </p>
            <ul>
              <li><strong>A neuron</strong> holds a number. It computes a weighted sum of the previous layer, adds a bias, and passes the result through a non-linear function.</li>
              <li><strong>Weights and biases</strong> are the knobs — the parameters gradient descent tunes. A small network has thousands; a large one has billions.</li>
              <li><strong>Layers</strong> compose. Early layers pick up simple structure such as edges; later layers combine those into something more abstract.</li>
              <li><strong>Non-linearity is essential.</strong> Without it, stacking layers collapses into a single linear transformation — depth would buy you nothing.</li>
            </ul>
            <p>
              The three-part skeleton hasn't changed since Module 1. The model is bigger; the loss and
              the optimiser are doing exactly what they did for the straight line.
            </p>
          `,
      },
      {
        moduleId: m4.id,
        order: 2,
        type: ActivityType.VIDEO,
        title: "How neural networks learn",
        duration: "21 mins",
        completionRule: "MANUAL",
        videoUrl: "https://www.youtube.com/watch?v=IHZwWFHWa-w",
        content:
          credit("Gradient descent, how neural networks learn | Deep Learning Chapter 2", "3Blue1Brown", "https://www.youtube.com/watch?v=IHZwWFHWa-w") +
          html`
            <h2>What to take away</h2>
            <p>
              This is the payoff of Module 1. Training a network is gradient descent — the same loop,
              over millions of parameters at once.
            </p>
            <ul>
              <li><strong>The cost function</strong> scores the network's output against the right answer across all training examples.</li>
              <li><strong>The gradient</strong> is now a vector with one entry per parameter, each saying which way to nudge that weight to reduce the cost.</li>
              <li><strong>Backpropagation</strong> is how that gradient is computed efficiently — the chain rule applied backwards through the layers.</li>
              <li><strong>Local minima</strong> — the surface is unimaginably high-dimensional. In practice this is far less of a problem than intuition from 2D pictures suggests.</li>
            </ul>
            <p>
              Watch the point about networks happily learning random labels. That's overfitting from
              Module 2, at scale: enough capacity will memorise anything, which is exactly why held-out
              evaluation is non-negotiable.
            </p>
          `,
      },
      {
        moduleId: m4.id,
        order: 3,
        type: ActivityType.QUIZ,
        title: "Graded quiz: neural networks",
        duration: "10 mins",
        completionRule: "SCORE_80",
        content: quiz([
          {
            id: "m4q1",
            question: "Why does a neural network need a non-linear activation function?",
            type: "mcq",
            options: [
              "To make training faster",
              "Without it, any stack of layers collapses into a single linear transformation, so depth adds nothing",
              "To keep every weight positive",
              "To stop the network from overfitting",
            ],
            correct: 1,
            explanation:
              "A composition of linear maps is itself linear. Non-linearity between layers is what lets depth represent things a single layer cannot.",
          },
          {
            id: "m4q2",
            question: "What does backpropagation actually do?",
            type: "mcq",
            options: [
              "Feeds the input forward to produce a prediction",
              "Efficiently computes the gradient of the cost with respect to every weight, working backwards through the layers",
              "Randomly reinitialises weights that stop improving",
              "Splits the data into training and validation sets",
            ],
            correct: 1,
            explanation:
              "Backprop is the chain rule applied backwards. It computes the gradient; gradient descent is what then uses that gradient to update the weights.",
          },
          {
            id: "m4q3",
            question: "Which of these are learnable parameters, tuned during training?",
            type: "multiselect",
            options: ["Weights", "Biases", "The learning rate", "The number of layers"],
            correct: [0, 1],
            explanation:
              "Weights and biases are learned. The learning rate and architecture are hyperparameters — you choose them; gradient descent does not.",
          },
          {
            id: "m4q4",
            question:
              "A large network trained on randomly shuffled labels reaches near-perfect training accuracy. What does this demonstrate?",
            type: "mcq",
            options: [
              "The network found a real pattern nobody had noticed",
              "Enough capacity can memorise anything, so training accuracy alone proves nothing about generalisation",
              "The learning rate was set too high",
              "The labels must not have been random after all",
            ],
            correct: 1,
            explanation:
              "There is no pattern in random labels — it memorised them. This is the sharpest possible demonstration of why held-out evaluation is the only honest measure.",
          },
        ]),
      },
      {
        moduleId: m4.id,
        order: 4,
        type: ActivityType.DISCUSSION,
        title: "Discussion: where would you apply this?",
        duration: "10 mins",
        completionRule: "MANUAL",
        content: html`
          <h2>Bring it back to your own work</h2>
          <p>Post a short reply covering one of these — and respond to someone else's:</p>
          <ul>
            <li>
              <strong>A problem you'd frame as ML.</strong> What would the model take as input, what would
              it predict, and where would the labelled examples come from? That last part is usually the hard one.
            </li>
            <li>
              <strong>Which error would hurt more.</strong> For your problem, is a false positive or a false
              negative worse — and what does that mean for the metric you'd optimise?
            </li>
            <li>
              <strong>Interpretability vs accuracy.</strong> Would you take a random forest that's 5% more
              accurate over a decision tree you can read aloud? What in your context decides that?
            </li>
          </ul>
        `,
      },
    ],
  });

  const activityCount = await prisma.activity.count({
    where: { module: { courseId: course.id } },
  });

  console.log(`Created "${course.title}" (${course.id})`);
  console.log(`  4 modules, ${activityCount} activities`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
