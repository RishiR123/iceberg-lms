import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";
import { notFound, redirect } from "next/navigation";
import { getLoggedInUser } from "@/lib/auth";
import { CourseProgressProvider } from "@/components/CourseProgressProvider";
import { getCompletedActivityIds } from "@/app/actions/learningActions";

export default async function LearnLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login");
  }

  const { courseId } = await params;

  // Admins can review any course; everyone else has to actually be enrolled.
  if (user.role !== "ADMIN") {
    const enrolled = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
      select: { id: true },
    });
    if (!enrolled) {
      redirect(`/course/${courseId}`);
    }
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          activities: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const completedActivityIds = await getCompletedActivityIds();

  return (
    <CourseProgressProvider initialCompleted={completedActivityIds}>
      <div className="flex flex-1 h-screen overflow-hidden relative">
        <Sidebar courseId={course.id} courseTitle={course.title} modules={course.modules} />
        <div className="flex-1 md:pl-72 overflow-y-auto bg-[#F8FAFC]">{children}</div>
      </div>
    </CourseProgressProvider>
  );
}
