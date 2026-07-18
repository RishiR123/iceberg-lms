"use client";

import { useState, useEffect } from "react";
import { PeoplePanel, type ManagedUser } from "@/components/admin/PeoplePanel";
import type { AssignableCourse } from "@/components/admin/AssignCourses";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { BookOpen, Trash2, Save, Plus, ArrowLeft, Globe, Loader2, Sparkles, FileText, CheckCircle2, Video, HelpCircle, MessageSquare, ChevronRight, LayoutDashboard } from "lucide-react";
import { ActivityType } from "@prisma/client";
import { 
  createCourseAction, 
  saveCourseAction, 
  deleteCourseAction,
  createModuleAction,
  saveModuleAction,
  deleteModuleAction,
  createActivityAction,
  saveActivityAction,
  deleteActivityAction
} from "./actions";

interface Activity {
  id: string;
  title: string;
  type: ActivityType;
  content: string;
  duration: string | null;
  resources: string | null;
  completionRule: string | null;
  videoUrl: string | null;
  order: number;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  activities: Activity[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  difficulty: string;
  duration: string;
  instructor: string;
  organization: string;
  skills: string;
  outcomes: string;
  faqs: string;
  modules: Module[];
}

export function AdminDashboard({
  initialCourses,
  users,
  currentUserId,
  userName,
  assignableCourses,
}: {
  initialCourses: Course[];
  users: ManagedUser[];
  currentUserId: string;
  userName: string;
  assignableCourses: AssignableCourse[];
}) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(courses[0]?.id || null);
  const [section, setSection] = useState<"courses" | "people">("courses");
  const [activeTab, setActiveTab] = useState<"info" | "syllabus" | "curriculum">("info");
  
  // Curriculum specific selection states
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const activeCourse = courses.find(c => c.id === activeCourseId) || null;
  const activeModule = activeCourse?.modules.find(m => m.id === activeModuleId) || null;
  const activeActivity = activeModule?.activities.find(a => a.id === activeActivityId) || null;

  // Form states for activeCourse
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    thumbnail: "",
    difficulty: "Beginner",
    duration: "10 hours",
    instructor: "Lead Engineer",
    organization: "Internal Corp",
    skills: "",
    outcomes: "",
    faqs: "",
  });

  // Form states for activeModule
  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    order: 1,
  });

  // Form states for activeActivity
  const [activityForm, setActivityForm] = useState<{
    title: string;
    type: ActivityType;
    content: string;
    duration: string;
    resources: string;
    completionRule: string;
    videoUrl: string;
    order: number;
  }>({
    title: "",
    type: ActivityType.VIDEO,
    content: "",
    duration: "10 mins",
    resources: "",
    completionRule: "",
    videoUrl: "",
    order: 1,
  });

  // Sync Course Form on activeCourseId change
  useEffect(() => {
    if (activeCourse) {
      setCourseForm({
        title: activeCourse.title,
        description: activeCourse.description,
        thumbnail: activeCourse.thumbnail || "",
        difficulty: activeCourse.difficulty,
        duration: activeCourse.duration,
        instructor: activeCourse.instructor,
        organization: activeCourse.organization,
        skills: activeCourse.skills,
        outcomes: activeCourse.outcomes,
        faqs: activeCourse.faqs,
      });

      // Clear curriculum choices
      if (activeCourse.modules.length > 0) {
        const firstMod = activeCourse.modules[0];
        setActiveModuleId(firstMod.id);
        if (firstMod.activities.length > 0) {
          setActiveActivityId(firstMod.activities[0].id);
        } else {
          setActiveActivityId(null);
        }
      } else {
        setActiveModuleId(null);
        setActiveActivityId(null);
      }
    }
  }, [activeCourseId, courses]);

  // Sync Module Form on activeModuleId change
  useEffect(() => {
    if (activeModule) {
      setModuleForm({
        title: activeModule.title,
        description: activeModule.description || "",
        order: activeModule.order,
      });
    } else {
      setModuleForm({ title: "", description: "", order: 1 });
    }
  }, [activeModuleId, activeCourse]);

  // Sync Activity Form on activeActivityId change
  useEffect(() => {
    if (activeActivity) {
      setActivityForm({
        title: activeActivity.title,
        type: activeActivity.type,
        content: activeActivity.content,
        duration: activeActivity.duration || "10 mins",
        resources: activeActivity.resources || "",
        completionRule: activeActivity.completionRule || "",
        videoUrl: activeActivity.videoUrl || "",
        order: activeActivity.order,
      });
    } else {
      setActivityForm({
        title: "",
        type: ActivityType.VIDEO,
        content: "",
        duration: "10 mins",
        resources: "",
        completionRule: "",
        videoUrl: "",
        order: 1,
      });
    }
  }, [activeActivityId, activeModule]);

  const showStatus = (msg: { type: "success" | "error"; text: string } | null) => {
    setStatusMessage(msg);
    if (msg?.type === "success") {
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Course management operations
  const handleCreateCourse = async () => {
    setLoading(true);
    showStatus(null);
    const res = await createCourseAction({
      title: "New Custom Engineering Track",
      description: "Enter a brief overview of what this track covers.",
    });

    if (res.success && res.courseId) {
      const newCourse: Course = {
        id: res.courseId,
        title: "New Custom Engineering Track",
        description: "Enter a brief overview of what this track covers.",
        thumbnail: null,
        difficulty: "Beginner",
        duration: "10 hours",
        instructor: "Lead Engineer",
        organization: "Internal Corp",
        skills: "",
        outcomes: "",
        faqs: "",
        modules: [],
      };
      setCourses(prev => [...prev, newCourse]);
      setActiveCourseId(res.courseId);
      showStatus({ type: "success", text: "New track created inside local catalog database!" });
    } else {
      showStatus({ type: "error", text: res.error || "Failed to create course." });
    }
    setLoading(false);
  };

  const handleSaveCourse = async () => {
    if (!activeCourseId) return;
    setLoading(true);
    showStatus(null);
    const res = await saveCourseAction(activeCourseId, courseForm);

    if (res.success) {
      setCourses(prev => prev.map(c => {
        if (c.id === activeCourseId) {
          return { ...c, ...courseForm };
        }
        return c;
      }));
      showStatus({ type: "success", text: "Course specifications saved successfully." });
    } else {
      showStatus({ type: "error", text: res.error || "Failed to save course." });
    }
    setLoading(false);
  };

  const handleDeleteCourse = async () => {
    if (!activeCourseId) return;
    if (!confirm("Are you absolutely sure you want to delete this curriculum and all its nested modules/lessons? This action is irreversible.")) return;
    
    setLoading(true);
    showStatus(null);
    const res = await deleteCourseAction(activeCourseId);

    if (res.success) {
      const updated = courses.filter(c => c.id !== activeCourseId);
      setCourses(updated);
      setActiveCourseId(updated[0]?.id || null);
      showStatus({ type: "success", text: "Curriculum deleted successfully." });
    } else {
      showStatus({ type: "error", text: res.error || "Failed to delete course." });
    }
    setLoading(false);
  };

  // Module management operations
  const handleCreateModule = async () => {
    if (!activeCourseId) return;
    setLoading(true);
    showStatus(null);
    
    const nextOrder = (activeCourse?.modules.length || 0) + 1;
    const res = await createModuleAction(activeCourseId, {
      title: `Module ${nextOrder}: New Modular Step`,
      description: "Describe the modular objectives and criteria for milestones.",
      order: nextOrder
    });

    if (res.success && res.moduleId) {
      const newMod: Module = {
        id: res.moduleId,
        title: `Module ${nextOrder}: New Modular Step`,
        description: "Describe the modular objectives and criteria for milestones.",
        order: nextOrder,
        activities: []
      };

      setCourses(prev => prev.map(c => {
        if (c.id === activeCourseId) {
          return {
            ...c,
            modules: [...c.modules, newMod]
          };
        }
        return c;
      }));

      setActiveModuleId(res.moduleId);
      setActiveActivityId(null);
      showStatus({ type: "success", text: "New module added to curriculum!" });
    } else {
      showStatus({ type: "error", text: res.error || "Failed to create module." });
    }
    setLoading(false);
  };

  const handleSaveModule = async () => {
    if (!activeModuleId) return;
    setLoading(true);
    showStatus(null);
    const res = await saveModuleAction(activeModuleId, moduleForm);

    if (res.success) {
      setCourses(prev => prev.map(c => {
        if (c.id === activeCourseId) {
          return {
            ...c,
            modules: c.modules.map(m => {
              if (m.id === activeModuleId) {
                return { ...m, ...moduleForm };
              }
              return m;
            }).sort((a, b) => a.order - b.order)
          };
        }
        return c;
      }));
      showStatus({ type: "success", text: "Module details updated successfully." });
    } else {
      showStatus({ type: "error", text: res.error || "Failed to save module." });
    }
    setLoading(false);
  };

  const handleDeleteModule = async () => {
    if (!activeModuleId) return;
    if (!confirm("Delete this module and all its nested units? This cannot be undone.")) return;

    setLoading(true);
    showStatus(null);
    const res = await deleteModuleAction(activeModuleId);

    if (res.success) {
      setCourses(prev => prev.map(c => {
        if (c.id === activeCourseId) {
          return {
            ...c,
            modules: c.modules.filter(m => m.id !== activeModuleId)
          };
        }
        return c;
      }));

      const remMods = activeCourse?.modules.filter(m => m.id !== activeModuleId) || [];
      if (remMods.length > 0) {
        setActiveModuleId(remMods[0].id);
        if (remMods[0].activities.length > 0) {
          setActiveActivityId(remMods[0].activities[0].id);
        } else {
          setActiveActivityId(null);
        }
      } else {
        setActiveModuleId(null);
        setActiveActivityId(null);
      }
      showStatus({ type: "success", text: "Module deleted successfully." });
    } else {
      showStatus({ type: "error", text: res.error || "Failed to delete module." });
    }
    setLoading(false);
  };

  // Activity/Unit management operations
  const handleCreateActivity = async (type: ActivityType) => {
    if (!activeModuleId) return;
    setLoading(true);
    showStatus(null);

    const nextOrder = (activeModule?.activities.length || 0) + 1;
    const res = await createActivityAction(activeModuleId, {
      title: `Practice: New ${type.replace("_", " ")} Workspace`,
      type,
      content: type === ActivityType.QUIZ || type === ActivityType.PRACTICE_QUIZ 
        ? "[]" 
        : "<p>Write rich workspace activity details here...</p>",
      duration: "10 mins",
      order: nextOrder
    });

    if (res.success && res.activityId) {
      const newAct: Activity = {
        id: res.activityId,
        title: `Practice: New ${type.replace("_", " ")} Workspace`,
        type,
        content: type === ActivityType.QUIZ || type === ActivityType.PRACTICE_QUIZ ? "[]" : "<p>Write rich workspace activity details here...</p>",
        duration: "10 mins",
        resources: null,
        completionRule: null,
        videoUrl: null,
        order: nextOrder
      };

      setCourses(prev => prev.map(c => {
        if (c.id === activeCourseId) {
          return {
            ...c,
            modules: c.modules.map(m => {
              if (m.id === activeModuleId) {
                return {
                  ...m,
                  activities: [...m.activities, newAct]
                };
              }
              return m;
            })
          };
        }
        return c;
      }));

      setActiveActivityId(res.activityId);
      showStatus({ type: "success", text: `New ${type.toLowerCase()} activity appended!` });
    } else {
      showStatus({ type: "error", text: res.error || "Failed to create activity." });
    }
    setLoading(false);
  };

  const handleSaveActivity = async () => {
    if (!activeActivityId) return;
    setLoading(true);
    showStatus(null);
    const res = await saveActivityAction(activeActivityId, activityForm);

    if (res.success) {
      setCourses(prev => prev.map(c => {
        if (c.id === activeCourseId) {
          return {
            ...c,
            modules: c.modules.map(m => {
              if (m.id === activeModuleId) {
                return {
                  ...m,
                  activities: m.activities.map(a => {
                    if (a.id === activeActivityId) {
                      return { ...a, ...activityForm };
                    }
                    return a;
                  }).sort((x, y) => x.order - y.order)
                };
              }
              return m;
            })
          };
        }
        return c;
      }));
      showStatus({ type: "success", text: "Activity parameters saved successfully." });
    } else {
      showStatus({ type: "error", text: res.error || "Failed to save activity." });
    }
    setLoading(false);
  };

  const handleDeleteActivity = async () => {
    if (!activeActivityId) return;
    if (!confirm("Remove this learning activity unit? This cannot be undone.")) return;

    setLoading(true);
    showStatus(null);
    const res = await deleteActivityAction(activeActivityId);

    if (res.success) {
      setCourses(prev => prev.map(c => {
        if (c.id === activeCourseId) {
          return {
            ...c,
            modules: c.modules.map(m => {
              if (m.id === activeModuleId) {
                return {
                  ...m,
                  activities: m.activities.filter(a => a.id !== activeActivityId)
                };
              }
              return m;
            })
          };
        }
        return c;
      }));

      const activeModCopy = activeCourse?.modules.find(m => m.id === activeModuleId);
      const remainingActs = activeModCopy?.activities.filter(a => a.id !== activeActivityId) || [];
      if (remainingActs.length > 0) {
        setActiveActivityId(remainingActs[0].id);
      } else {
        setActiveActivityId(null);
      }
      showStatus({ type: "success", text: "Activity deleted successfully." });
    } else {
      showStatus({ type: "error", text: res.error || "Failed to delete activity." });
    }
    setLoading(false);
  };

  // Type visual configurations
  const getActivityTypeConfig = (type: string) => {
    switch (type) {
      case "VIDEO":
        return { color: "bg-[#F8FAFC] text-[#0F172A]", icon: <Video className="w-3.5 h-3.5 text-[#0F172A]" /> };
      case "READING":
        return { color: "bg-[#EEF2FF] text-green-900", icon: <BookOpen className="w-3.5 h-3.5 text-green-900" /> };
      case "QUIZ":
      case "PRACTICE_QUIZ":
        return { color: "bg-[#EEF2FF] text-[#4F46E5]", icon: <HelpCircle className="w-3.5 h-3.5 text-[#0F172A]" /> };
      case "DISCUSSION":
        return { color: "bg-[#EEF2FF] text-cyan-900", icon: <MessageSquare className="w-3.5 h-3.5 text-cyan-900" /> };
      default:
        return { color: "bg-slate-100 text-slate-700", icon: <Video className="w-3.5 h-3.5 text-slate-700" /> };
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background selection:bg-[#EEF2FF] selection:text-[#0F172A] font-sans">
      
      <AdminSidebar
        section={section}
        onSelect={setSection}
        courseCount={courses.length}
        userCount={users.length}
        userName={userName}
      />

      {/* Content column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-14 flex-shrink-0 border-b border-[#E2E8F0]/40 bg-white flex items-center justify-between px-6 select-none">
          <div>
            <h1 className="text-sm font-black text-[#0F172A] capitalize">{section}</h1>
            <p className="text-[10px] text-[#64748B] font-semibold">
              {section === "courses"
                ? `${courses.length} course${courses.length === 1 ? "" : "s"} published`
                : `${users.length} account${users.length === 1 ? "" : "s"}`}
            </p>
          </div>
          {statusMessage && (
            <span
              className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${
                statusMessage.type === "success"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {statusMessage.text}
            </span>
          )}
        </header>

      {/* 2b. People workspace */}
      {section === "people" && (
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="bg-white border border-[#E2E8F0]/50 rounded-3xl p-6 md:p-8 shadow-sm">
              <PeoplePanel users={users} currentUserId={currentUserId} courses={assignableCourses} />
            </div>
          </div>
        </main>
      )}

      {/* 2. Main Flex Workspace Panel */}
      {section === "courses" && (
      <div className="flex-1 flex min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Track Selector Catalog Sidebar */}
        <aside className="w-80 flex-shrink-0 border-r border-[#E2E8F0]/40 bg-white flex flex-col h-full select-none">
          <div className="p-4 border-b border-[#E2E8F0]/30 flex items-center justify-between">
            <div className="text-left">
              <h2 className="text-xs font-black uppercase text-[#64748B] tracking-wider flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4 text-[#0F172A]" /> Active Tracks
              </h2>
              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{courses.length} courses loaded</span>
            </div>
            <button 
              onClick={handleCreateCourse}
              disabled={loading}
              className="p-2 rounded-xl bg-[#0F172A] hover:bg-[#0F172A]/90 text-white disabled:opacity-50 transition-all shadow-md cursor-pointer flex items-center justify-center hover:scale-102"
              title="Create New Course"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Track Cards Scroll list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {courses.map(course => {
              const isSelected = course.id === activeCourseId;
              const totalActs = course.modules.flatMap(m => m.activities).length;
              return (
                <div 
                  key={course.id}
                  onClick={() => setActiveCourseId(course.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                    isSelected 
                      ? "bg-[#F8FAFC]/45 border-[#0F172A] shadow-inner font-extrabold" 
                      : "border-[#E2E8F0]/30 bg-[#FAFAFA]/40 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <h3 className={`text-xs font-black leading-snug line-clamp-2 ${isSelected ? "text-[#0F172A]" : "text-[#64748B]"}`}>
                      {course.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-bold">
                    <span className="bg-[#EEF2FF] text-[#0F172A] px-2 py-0.5 rounded-full uppercase">{course.organization}</span>
                    <span className="text-slate-400">{totalActs} units</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-[#E2E8F0]/30 bg-[#F8FAFC]/10 text-[10px] text-[#64748B] flex justify-between items-center font-bold">
            <a href="/dashboard" className="hover:text-[#0F172A] flex items-center gap-1 transition-colors !no-underline hover:!no-underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Student Catalog
            </a>
            <span className="text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 block" /> DB Synced</span>
          </div>
        </aside>

        {/* RIGHT COLUMN: Parameters Form Workspace */}
        <main className="flex-1 flex flex-col h-full bg-[#F8FAFC]/10 overflow-hidden relative">
          {activeCourse ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              
              {/* Active course header */}
              <div className="px-6 py-4 border-b border-[#E2E8F0]/30 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white z-10 shadow-sm text-left">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-[#64748B] uppercase tracking-wider block">Currently Editing Track</span>
                  <h1 className="text-sm font-black text-[#0F172A] truncate max-w-lg">{activeCourse.title}</h1>
                </div>

                <div className="flex items-center gap-3">
                  {statusMessage && (
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 border ${
                      statusMessage.type === "success" 
                        ? "bg-[#EEF2FF]/30 text-green-800 border-green-200" 
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                      {statusMessage.type === "success" ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                      {statusMessage.text}
                    </span>
                  )}

                  <button 
                    onClick={handleDeleteCourse}
                    disabled={loading}
                    className="px-3.5 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-sm cursor-pointer hover:scale-101"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Track
                  </button>
                </div>
              </div>

              {/* Dynamic Tab Toggle Button Pill row */}
              <div className="px-6 py-3.5 border-b border-[#E2E8F0]/30 bg-white flex gap-4 text-xs select-none">
                <button 
                  onClick={() => setActiveTab("info")}
                  className={`px-4 py-2 text-xs font-black rounded-full transition-all border cursor-pointer ${
                    activeTab === "info" 
                      ? "bg-[#0F172A] text-white border-[#0F172A] shadow-md" 
                      : "bg-[#FAFAFA]/50 border-[#E2E8F0]/60 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50"
                  }`}
                >
                  1. Track Specifications
                </button>
                <button 
                  onClick={() => setActiveTab("syllabus")}
                  className={`px-4 py-2 text-xs font-black rounded-full transition-all border cursor-pointer ${
                    activeTab === "syllabus" 
                      ? "bg-[#0F172A] text-white border-[#0F172A] shadow-md" 
                      : "bg-[#FAFAFA]/50 border-[#E2E8F0]/60 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50"
                  }`}
                >
                  2. Syllabus Metadata
                </button>
                <button 
                  onClick={() => setActiveTab("curriculum")}
                  className={`px-4 py-2 text-xs font-black rounded-full transition-all border cursor-pointer ${
                    activeTab === "curriculum" 
                      ? "bg-[#0F172A] text-white border-[#0F172A] shadow-md" 
                      : "bg-[#FAFAFA]/50 border-[#E2E8F0]/60 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50"
                  }`}
                >
                  3. Curriculum Builder ({activeCourse.modules.length} Modules)
                </button>
              </div>

              {/* Sub Panels area */}
              <div className="flex-1 overflow-hidden">
                
                {/* TAB 1: Specifications Input form */}
                {activeTab === "info" && (
                  <div className="p-6 overflow-y-auto h-full space-y-6 max-w-4xl text-left">
                    <div className="bg-white border border-[#E2E8F0]/40 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                      <h2 className="text-xs font-black uppercase text-[#64748B] tracking-wider mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#0F172A]" /> Define Primary Track Scope
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider block">Course Title</label>
                          <input 
                            type="text" 
                            value={courseForm.title}
                            onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                            className="w-full text-xs border border-[#E2E8F0]/60 pl-4 pr-4 py-3 rounded-xl bg-slate-50 focus:outline-none focus:border-[#0F172A]/60 focus:bg-white transition-all font-semibold text-[#0F172A]"
                            placeholder="e.g. Enterprise Web Architecture"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider block">Partner Organization</label>
                          <input 
                            type="text" 
                            value={courseForm.organization}
                            onChange={(e) => setCourseForm({ ...courseForm, organization: e.target.value })}
                            className="w-full text-xs border border-[#E2E8F0]/60 pl-4 pr-4 py-3 rounded-xl bg-slate-50 focus:outline-none focus:border-[#0F172A]/60 focus:bg-white transition-all font-semibold text-[#0F172A]"
                            placeholder="e.g. Vercel, Stanford, Iceberg"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider block">Lead Instructor</label>
                          <input 
                            type="text" 
                            value={courseForm.instructor}
                            onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                            className="w-full text-xs border border-[#E2E8F0]/60 pl-4 pr-4 py-3 rounded-xl bg-slate-50 focus:outline-none focus:border-[#0F172A]/60 focus:bg-white transition-all font-semibold text-[#0F172A]"
                            placeholder="e.g. Elizabeth Allison"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider block">Estimated Duration</label>
                          <input 
                            type="text" 
                            value={courseForm.duration}
                            onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                            className="w-full text-xs border border-[#E2E8F0]/60 pl-4 pr-4 py-3 rounded-xl bg-slate-50 focus:outline-none focus:border-[#0F172A]/60 focus:bg-white transition-all font-semibold text-[#0F172A]"
                            placeholder="e.g. 12 hours"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider block">Thumbnail Image URL</label>
                          <input 
                            type="text" 
                            value={courseForm.thumbnail}
                            onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                            className="w-full text-xs border border-[#E2E8F0]/60 pl-4 pr-4 py-3 rounded-xl bg-slate-50 focus:outline-none focus:border-[#0F172A]/60 focus:bg-white transition-all font-semibold text-[#0F172A]"
                            placeholder="Unsplash image or static asset url"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider block">Difficulty Level</label>
                          <select 
                            value={courseForm.difficulty}
                            onChange={(e) => setCourseForm({ ...courseForm, difficulty: e.target.value })}
                            className="w-full text-xs border border-[#E2E8F0]/60 pl-4 pr-4 py-3 rounded-xl bg-slate-50 focus:outline-none focus:border-[#0F172A]/60 focus:bg-white transition-all font-semibold text-[#0F172A] h-[46px]"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider block">Course Overview / Description</label>
                        <textarea 
                          rows={4}
                          value={courseForm.description}
                          onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                          className="w-full text-xs border border-[#E2E8F0]/60 p-4 rounded-xl bg-slate-50 focus:outline-none focus:border-[#0F172A]/60 focus:bg-white transition-all font-semibold text-[#0F172A] leading-relaxed"
                          placeholder="Write a concise overview outlining what learners will build and master."
                        />
                      </div>

                      <div className="flex items-center gap-4 pt-4 border-t border-[#E2E8F0]/20">
                        <button 
                          onClick={handleSaveCourse}
                          disabled={loading}
                          className="px-5 py-2.5 bg-[#0F172A] hover:bg-[#0F172A]/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer transition-transform active:scale-98"
                        >
                          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          Save Specifications
                        </button>
                        {courseForm.thumbnail && (
                          <div className="w-20 aspect-video rounded-xl border border-[#E2E8F0]/40 overflow-hidden bg-slate-100 shrink-0">
                            <img src={courseForm.thumbnail} alt="preview" className="object-cover w-full h-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Syllabus Metadata */}
                {activeTab === "syllabus" && (
                  <div className="p-6 overflow-y-auto h-full space-y-6 max-w-4xl text-left">
                    <div className="bg-white border border-[#E2E8F0]/40 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                      <h2 className="text-xs font-black uppercase text-[#64748B] tracking-wider mb-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#0F172A]" /> Curriculum Requirements & Outlines
                      </h2>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider block flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-[#0F172A]" /> Skills Acquired
                        </label>
                        <p className="text-[9px] text-[#64748B] font-semibold -mt-1">Enter key technical skills, separated by commas.</p>
                        <input 
                          type="text" 
                          value={courseForm.skills}
                          onChange={(e) => setCourseForm({ ...courseForm, skills: e.target.value })}
                          className="w-full text-xs border border-[#E2E8F0]/60 pl-4 pr-4 py-3 rounded-xl bg-slate-50 focus:outline-none focus:border-[#0F172A]/60 focus:bg-white transition-all font-semibold text-[#0F172A]"
                          placeholder="e.g. Next.js, Server Components, TypeScript, Server Actions"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider block flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-[#0F172A]" /> Learning Outcomes
                        </label>
                        <p className="text-[9px] text-[#64748B] font-semibold -mt-1">What will students be able to do? Enter separate items separated by a pipe (<code>|</code>).</p>
                        <textarea 
                          rows={4}
                          value={courseForm.outcomes}
                          onChange={(e) => setCourseForm({ ...courseForm, outcomes: e.target.value })}
                          className="w-full text-xs border border-[#E2E8F0]/60 p-4 rounded-xl bg-slate-50 focus:outline-none focus:border-[#0F172A]/60 focus:bg-white transition-all font-semibold text-[#0F172A] leading-relaxed font-mono"
                          placeholder="Master state management with React Server Actions | Optimize caching parameters natively"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider block flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-[#0F172A]" /> Frequently Asked Questions (FAQ)
                        </label>
                        <p className="text-[9px] text-[#64748B] font-semibold -mt-1">Structure each item as <code>Question - Answer</code> and separate individual FAQs with a pipe (<code>|</code>).</p>
                        <textarea 
                          rows={5}
                          value={courseForm.faqs}
                          onChange={(e) => setCourseForm({ ...courseForm, faqs: e.target.value })}
                          className="w-full text-xs border border-[#E2E8F0]/60 p-4 rounded-xl bg-slate-50 focus:outline-none focus:border-[#0F172A]/60 focus:bg-white transition-all font-semibold text-[#0F172A] leading-relaxed font-mono"
                          placeholder="Is this self-paced? - Yes, you can complete all assignments anytime. | Do I get a certificate? - Yes, completing all checks awards a certificate."
                        />
                      </div>

                      <div className="pt-4 border-t border-[#E2E8F0]/20">
                        <button 
                          onClick={handleSaveCourse}
                          disabled={loading}
                          className="px-5 py-2.5 bg-[#0F172A] hover:bg-[#0F172A]/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
                        >
                          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          Save Syllabus Metadata
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Curriculum builder */}
                {activeTab === "curriculum" && (
                  <div className="flex h-full overflow-hidden select-none p-5 gap-5">
                    
                    {/* COLUMN 1: Modules list (lavender container) */}
                    <div className="w-72 flex-shrink-0 flex flex-col h-full bg-white border border-[#E2E8F0]/40 rounded-3xl p-4 shadow-sm text-left">
                      <div className="pb-3 border-b border-[#E2E8F0]/30 flex items-center justify-between">
                        <div className="min-w-0">
                          <span className="text-[8px] font-black uppercase text-[#64748B] tracking-wider block">Course Units</span>
                          <span className="text-xs font-black text-[#0F172A] block mt-0.5">Modular Steps</span>
                        </div>
                        <button 
                          onClick={handleCreateModule}
                          disabled={loading}
                          className="p-1.5 rounded-xl bg-[#F8FAFC] text-[#0F172A] hover:bg-[#EEF2FF] transition-all cursor-pointer shadow-sm border border-[#E2E8F0]/50 shrink-0"
                          title="Create New Module"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Modular item list */}
                      <div className="flex-1 overflow-y-auto pt-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200">
                        {activeCourse.modules.map((mod) => {
                          const isSel = mod.id === activeModuleId;
                          return (
                            <div
                              key={mod.id}
                              onClick={() => {
                                setActiveModuleId(mod.id);
                                if (mod.activities.length > 0) {
                                  setActiveActivityId(mod.activities[0].id);
                                } else {
                                  setActiveActivityId(null);
                                }
                              }}
                              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                                isSel 
                                  ? "bg-[#F8FAFC]/35 border-[#0F172A] font-extrabold shadow-inner" 
                                  : "border-transparent hover:bg-[#FAFAFA]/70"
                              }`}
                            >
                              <div className="min-w-0 flex-1 pr-1.5">
                                <span className="text-[8px] font-black block text-[#64748B] uppercase">Module {mod.order}</span>
                                <span className={`text-[11px] leading-snug font-bold block truncate mt-0.5 ${isSel ? "text-[#0F172A]" : "text-[#64748B]"}`}>
                                  {mod.title}
                                </span>
                              </div>
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform text-slate-300 flex-shrink-0 ${isSel ? "translate-x-0.5 text-[#0F172A]" : ""}`} />
                            </div>
                          );
                        })}
                        {activeCourse.modules.length === 0 && (
                          <div className="p-4 text-center text-xs text-[#64748B] font-semibold italic">
                            No modules yet. Click + to add.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* COLUMN 2: Active Module details & activities (lavender container) */}
                    <div className="w-80 flex-shrink-0 flex flex-col h-full bg-white border border-[#E2E8F0]/40 rounded-3xl p-4 shadow-sm text-left">
                      {activeModule ? (
                        <div className="flex-1 flex flex-col h-full overflow-hidden">
                          {/* Module Parameters Editor block */}
                          <div className="pb-3 border-b border-[#E2E8F0]/30 space-y-2.5 bg-[#FAFAFA]/50 p-2.5 rounded-2xl border border-[#E2E8F0]/20">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black uppercase text-[#64748B] tracking-wider">Module Parameters</span>
                              <button
                                onClick={handleDeleteModule}
                                className="text-[9px] text-red-600 font-bold hover:underline cursor-pointer"
                              >
                                Delete Module
                              </button>
                            </div>
                            <div className="space-y-2">
                              <input 
                                type="text"
                                value={moduleForm.title}
                                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                                className="w-full text-xs border border-[#E2E8F0]/50 px-3 py-2 rounded-xl bg-white focus:outline-none focus:border-[#0F172A] font-semibold text-[#0F172A]"
                                placeholder="Module Title"
                              />
                              <textarea 
                                rows={2}
                                value={moduleForm.description}
                                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                                className="w-full text-[10px] border border-[#E2E8F0]/50 p-2 rounded-xl bg-white focus:outline-none focus:border-[#0F172A] leading-relaxed font-semibold text-[#64748B]"
                                placeholder="Describe this milestone segment..."
                              />
                              <div className="flex justify-between items-center pt-1">
                                <div className="flex items-center space-x-1">
                                  <span className="text-[9px] text-[#64748B] font-bold">Order:</span>
                                  <input 
                                    type="number"
                                    value={moduleForm.order}
                                    onChange={(e) => setModuleForm({ ...moduleForm, order: parseInt(e.target.value) || 1 })}
                                    className="w-10 text-[10px] border border-slate-200 px-1 py-1 rounded-md text-center font-bold"
                                  />
                                </div>
                                <button
                                  onClick={handleSaveModule}
                                  className="px-3 py-1.5 bg-[#0F172A] text-white text-[9.5px] font-black rounded-lg shadow-sm hover:bg-[#0F172A]/90 cursor-pointer"
                                >
                                  Update Module
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Activities list listbox */}
                          <div className="py-2.5 border-b border-[#E2E8F0]/20 flex items-center justify-between select-none mt-2">
                            <span className="text-[9px] font-black text-[#64748B] uppercase">Activities ({activeModule.activities.length})</span>
                            
                            <select 
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleCreateActivity(e.target.value as ActivityType);
                                  e.target.value = "";
                                }
                              }}
                              className="text-[9px] font-black border border-[#E2E8F0] bg-white px-2 py-1 rounded-lg text-[#0F172A] focus:outline-none cursor-pointer hover:bg-slate-50 shadow-sm"
                            >
                              <option value="">+ Add Activity</option>
                              <option value={ActivityType.VIDEO}>Video Lecture</option>
                              <option value={ActivityType.READING}>Technical Reading</option>
                              <option value={ActivityType.QUIZ}>Graded Quiz</option>
                              <option value={ActivityType.PRACTICE_QUIZ}>Practice Quiz</option>
                              <option value={ActivityType.DISCUSSION}>Discussion Forum</option>
                            </select>
                          </div>

                          <div className="flex-1 overflow-y-auto pt-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200">
                            {activeModule.activities.map((act, index) => {
                              const isSelAct = act.id === activeActivityId;
                              const typeConf = getActivityTypeConfig(act.type);
                              return (
                                <div
                                  key={act.id}
                                  onClick={() => setActiveActivityId(act.id)}
                                  className={`p-2.5 rounded-2xl border text-left cursor-pointer flex items-center justify-between transition-all ${
                                    isSelAct 
                                      ? "bg-[#F8FAFC]/35 border-[#0F172A] shadow-inner" 
                                      : "border-transparent hover:bg-[#FAFAFA]/70"
                                  }`}
                                >
                                  <div className="min-w-0 flex-1 pr-1.5 flex items-start gap-2">
                                    <div className={`p-1.5 rounded-xl flex-shrink-0 ${typeConf.color}`}>
                                      {typeConf.icon}
                                    </div>
                                    <div className="min-w-0">
                                      <span className="text-[8px] text-[#64748B] block font-extrabold">Unit {index + 1} • {act.type.replace("_", " ")}</span>
                                      <span className={`text-[11px] leading-snug block truncate font-bold ${isSelAct ? "text-[#0F172A]" : "text-[#64748B]"}`}>
                                        {act.title}
                                      </span>
                                    </div>
                                  </div>
                                  <ChevronRight className={`w-3.5 h-3.5 text-slate-300 ${isSelAct ? "text-[#0F172A]" : ""}`} />
                                </div>
                              );
                            })}
                            {activeModule.activities.length === 0 && (
                              <div className="p-6 text-center text-xs text-[#64748B] font-semibold italic bg-slate-50 rounded-2xl mt-4">
                                Choose an Activity Type above to spawn the first module unit!
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-10 text-center text-xs text-[#64748B] font-semibold italic h-full flex flex-col items-center justify-center">
                          Select a course module on the left to review its lessons and activities list.
                        </div>
                      )}
                    </div>

                    {/* COLUMN 3: Active Activity Details & parameters config workspace */}
                    <div className="flex-1 flex flex-col h-full bg-white border border-[#E2E8F0]/40 rounded-3xl p-4 shadow-sm text-left overflow-hidden">
                      {activeActivity ? (
                        <div className="flex-1 flex flex-col h-full overflow-hidden">
                          
                          {/* Parameter Action Header */}
                          <div className="pb-3 border-b border-[#E2E8F0]/30 flex items-center justify-between flex-shrink-0">
                            <span className="text-[9px] font-black text-[#64748B] uppercase tracking-wider">Unit Parameters Configuration</span>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={handleDeleteActivity}
                                className="text-[9px] text-red-600 font-bold hover:underline cursor-pointer"
                              >
                                Delete Unit
                              </button>
                              <button
                                onClick={handleSaveActivity}
                                className="px-3.5 py-1.5 bg-[#0F172A] hover:bg-[#0F172A]/90 text-white text-[10px] font-black rounded-xl shadow-sm flex items-center gap-1 cursor-pointer transition-transform active:scale-98"
                              >
                                <Save className="w-3 h-3" /> Save Parameters
                              </button>
                            </div>
                          </div>

                          {/* Parameter Form Fields */}
                          <div className="flex-1 overflow-y-auto pt-4 space-y-4 text-left scrollbar-thin scrollbar-thumb-slate-200 pr-1">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider block">Activity Title</label>
                                <input 
                                  type="text"
                                  value={activityForm.title}
                                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                                  className="w-full text-xs border border-[#E2E8F0]/50 px-3 py-2 rounded-xl bg-slate-50 focus:outline-none focus:border-[#0F172A] font-semibold text-[#0F172A]"
                                  placeholder="Activity Title"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider block">Expected Duration</label>
                                <input 
                                  type="text"
                                  value={activityForm.duration}
                                  onChange={(e) => setActivityForm({ ...activityForm, duration: e.target.value })}
                                  className="w-full text-xs border border-[#E2E8F0]/50 px-3 py-2 rounded-xl bg-slate-50 focus:outline-none focus:border-[#0F172A] font-semibold text-[#0F172A]"
                                  placeholder="e.g. 10 mins"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider block">Category Type</label>
                                <select 
                                  value={activityForm.type}
                                  onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value as ActivityType })}
                                  className="w-full text-xs border border-[#E2E8F0]/50 px-3 py-2 rounded-xl bg-slate-50 focus:outline-none focus:border-[#0F172A] font-semibold text-[#0F172A] h-[35px]"
                                >
                                  <option value={ActivityType.VIDEO}>Video Lecture</option>
                                  <option value={ActivityType.READING}>Technical Reading</option>
                                  <option value={ActivityType.QUIZ}>Graded Quiz</option>
                                  <option value={ActivityType.PRACTICE_QUIZ}>Practice Quiz</option>
                                  <option value={ActivityType.DISCUSSION}>Discussion Forum</option>
                                </select>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider block">Order rank</label>
                                <input 
                                  type="number"
                                  value={activityForm.order}
                                  onChange={(e) => setActivityForm({ ...activityForm, order: parseInt(e.target.value) || 1 })}
                                  className="w-full text-xs border border-[#E2E8F0]/50 px-3 py-2 rounded-xl bg-slate-50 focus:outline-none focus:border-[#0F172A] font-semibold text-[#0F172A]"
                                />
                              </div>
                            </div>

                            {/* Only a VIDEO activity has anywhere to put this. */}
                            {activityForm.type === ActivityType.VIDEO && (
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider block flex items-center gap-1">
                                  <Video className="w-3.5 h-3.5 text-[#0F172A]" /> YouTube Video URL
                                </label>
                                <p className="text-[9px] text-[#64748B] font-semibold -mt-1">
                                  Paste a normal YouTube link — watch, share, embed or shorts all work.
                                </p>
                                <input
                                  type="url"
                                  value={activityForm.videoUrl}
                                  onChange={(e) => setActivityForm({ ...activityForm, videoUrl: e.target.value })}
                                  className="w-full text-xs border border-[#E2E8F0]/50 px-3 py-2 rounded-xl bg-slate-50 focus:outline-none focus:border-[#0F172A] font-semibold text-[#0F172A] font-mono"
                                  placeholder="https://www.youtube.com/watch?v=..."
                                />
                              </div>
                            )}

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider block flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5 text-[#0F172A]" /> Dynamic Resource Downloads
                              </label>
                              <p className="text-[9px] text-[#64748B] font-semibold -mt-1">Enter download guides in standard format: <code>Title - Link | Title2 - Link2</code></p>
                              <input 
                                type="text"
                                value={activityForm.resources}
                                onChange={(e) => setActivityForm({ ...activityForm, resources: e.target.value })}
                                className="w-full text-xs border border-[#E2E8F0]/50 px-3 py-2 rounded-xl bg-slate-50 focus:outline-none focus:border-[#0F172A] font-semibold text-[#0F172A] font-mono"
                                placeholder="e.g. Whispers Master Document - /files/doc.pdf"
                              />
                            </div>

                            {/* Workspace Content configuration panel with matching instructions */}
                            <div className="flex-1 flex flex-col space-y-2 min-h-[300px]">
                              <label className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider block flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-[#0F172A]" /> Workspace Content Configuration
                              </label>
                              <span className="text-[9.5px] text-[#64748B] font-semibold block -mt-1 bg-[#F8FAFC]/35 p-3 rounded-2xl border border-[#E2E8F0]/30">
                                {activityForm.type === ActivityType.VIDEO && (
                                  <span><strong>Video Transcripts:</strong> Enter rich lecture notes or transcripts using HTML tags (e.g. <code>&lt;h2&gt;, &lt;p&gt;, &lt;pre&gt;&lt;code&gt;</code>).</span>
                                )}
                                {activityForm.type === ActivityType.READING && (
                                  <span><strong>Technical Prose:</strong> Enter complete learning materials using rich HTML formatting representing the core chapter content.</span>
                                )}
                                {(activityForm.type === ActivityType.QUIZ || activityForm.type === ActivityType.PRACTICE_QUIZ) && (
                                  <span><strong>Questions JSON Format:</strong> Store structured questions in the textarea as a valid JSON Array. Format:<br /><code>[&#123; "id": "q1", "question": "Question text?", "type": "mcq", "options": ["Opt1", "Opt2"], "correct": 0, "explanation": "Why correct" &#125;]</code></span>
                                )}
                                {activityForm.type === ActivityType.DISCUSSION && (
                                  <span><strong>Discussion Prompt:</strong> Enter a complete discussion card description prompting student interaction.</span>
                                )}
                              </span>
                              <textarea 
                                value={activityForm.content}
                                onChange={(e) => setActivityForm({ ...activityForm, content: e.target.value })}
                                className="flex-1 w-full text-xs border border-[#E2E8F0]/50 p-4 rounded-2xl bg-slate-50 focus:outline-none focus:border-[#0F172A] font-mono leading-relaxed h-[360px] resize-y font-semibold text-[#0F172A]"
                                placeholder="Enter dynamic notes, guides, or structured JSON arrays depending on activity type..."
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-10 text-center text-xs text-[#64748B] font-semibold italic h-full flex flex-col items-center justify-center">
                          <HelpCircle className="w-10 h-10 text-slate-300 mb-3" />
                          <h4 className="font-extrabold text-xs text-[#0F172A]">No Selected Activity</h4>
                          <p className="text-[9.5px] text-[#64748B] mt-1">Click "Add Activity" inside the center panel or select an existing unit item to begin parameter configurations.</p>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 text-center h-full text-slate-400 select-none">
              <Globe className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="font-extrabold text-sm text-[#0F172A]">Curriculum Directory Empty</h3>
              <p className="text-xs text-[#64748B] font-semibold mt-1">Create a new course curriculum to populate the platform's active database directory.</p>
              <button 
                onClick={handleCreateCourse}
                disabled={loading}
                className="mt-4 px-5 py-2.5 bg-[#0F172A] hover:bg-[#0F172A]/90 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create First Course
              </button>
            </div>
          )}
        </main>
      </div>
      )}
      </div>
    </div>
  );
}
