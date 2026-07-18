import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "./AdminDashboard";
import { Metadata } from "next";
import { getLoggedInUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listUsersAction } from "@/app/actions/accountActions";
import { listCoursesWithAssignmentsAction } from "@/app/actions/enrollmentActions";

export const metadata: Metadata = {
  title: "Admin Portal | Internal LMS",
  description: "Curriculum Content Management System",
};

export default async function AdminPage() {
  const user = await getLoggedInUser();
  // Signed out goes to the admin portal; a signed-in student goes back to their
  // own catalog rather than a login screen they don't need.
  if (!user) {
    redirect("/adminlogin?next=/admin");
  }
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const courses = await prisma.course.findMany({
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
    orderBy: {
      createdAt: "asc",
    },
  });

  const [{ users }, { courses: assignableCourses }] = await Promise.all([
    listUsersAction(),
    listCoursesWithAssignmentsAction(),
  ]);

  return (
    <AdminDashboard
      initialCourses={courses}
      users={users}
      currentUserId={user.id}
      userName={user.name}
      assignableCourses={assignableCourses}
    />
  );
}
