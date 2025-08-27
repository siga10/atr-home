
"use client";

import { useContent } from "@/components/ContentProvider";
import { useState, useRef, useEffect } from "react";
import { Project, ProjectMedia, Category } from "@/content/types";
import { ProjectService, ContentService, CategoryService } from "@/lib/dataService";
import type { Project as SupabaseProject } from "@/lib/supabase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { LogOut, User, Database, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataMigration } from "@/lib/migration";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserService, type UserInfo } from "@/lib/userService";
import { EnhancedMediaManager } from "@/components/EnhancedMediaManager";

type AdminTab = "projects" | "featured" | "categories" | "slideshow" | "content" | "media" | "social" | "settings" | "users" | "migration";

function AdminPageContent() {
  const { content, setContent, lang, refreshProjects } = useContent();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("projects");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<Partial<Project>>({});
  const [newProjectCoverFile, setNewProjectCoverFile] = useState<File | null>(null);
  const [slideshowImages, setSlideshowImages] = useState<string[]>(["/vercel.svg", "/globe.svg", "/window.svg"]);
  const [json, setJson] = useState<string>(JSON.stringify(content, null, 2));
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | null;
  }>({ message: "", type: null });
  const [isMigrating, setIsMigrating] = useState(false);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userMessage, setUserMessage] = useState<{ text: string; type: 'success' | 'error' | null }>({ text: '', type: null });
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Categories management state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryMessage, setCategoryMessage] = useState<{ text: string; type: 'success' | 'error' | null }>({ text: '', type: null });
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Load categories for project form
  const [projectCategories, setProjectCategories] = useState<Category[]>([]);
  const [loadingProjectCategories, setLoadingProjectCategories] = useState(false);

  const addProject = async () => {
    if (!newProject.name || !newProject.slug) {
      alert("Please fill in project name and slug.");
      return;
    }
    
    if (!newProjectCoverFile) {
      alert("Please upload a cover image for the project.");
      return;
    }

    setIsLoading(true);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const supabaseProject: Omit<SupabaseProject, 'id' | 'created_at' | 'updated_at'> = {
          slug: newProject.slug!,
          name: newProject.name!,
          duration: newProject.duration || "1 month",
          location: newProject.location,
          tags: newProject.tags || [],
          coverUrl: reader.result as string,
          images: [],
          content: undefined
        };

        // Save to Supabase
        const created = await ProjectService.create(supabaseProject);
        
        if (created) {
          alert("Project added successfully!");
          // Refresh projects data
          await refreshProjects();
          // Clear form
          setNewProject({});
          setNewProjectCoverFile(null);
        } else {
          alert("Failed to add project. Please try again.");
        }
        
        setIsLoading(false);
      };
      
      reader.onerror = () => {
        alert("Error reading file.");
        setIsLoading(false);
      };
      
      reader.readAsDataURL(newProjectCoverFile);
    } catch (error) {
      console.error('Error adding project:', error);
      alert("Error adding project. Please try again.");
      setIsLoading(false);
    }
  };

  const updateProject = (slug: string, updates: Partial<Project>) => {
    const updatedContent = {
      ...content,
      projects: content.projects.map(p => p.slug === slug ? { ...p, ...updates } : p)
    };
    setContent(updatedContent);
    setEditingProject(null);
  };

  const deleteProject = (slug: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      const updatedContent = {
        ...content,
        projects: content.projects.filter(p => p.slug !== slug)
      };
      setContent(updatedContent);
    }
  };

  const addMediaToProject = async (projectSlug: string, media: ProjectMedia) => {
    try {
      // Find the project to get its current gallery
      const project = content.projects.find(p => p.slug === projectSlug);
      if (!project) {
        console.error('Project not found:', projectSlug);
        return;
      }

      // Update gallery in database
      const newGallery = [...(project.gallery || []), media];
      const success = await ProjectService.updateGallery(projectSlug, newGallery);
      
      if (success) {
        // Update local content after successful database update
        const updatedContent = {
          ...content,
          projects: content.projects.map(p => 
            p.slug === projectSlug 
              ? { ...p, gallery: newGallery }
              : p
          )
        };
        setContent(updatedContent);
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
        notification.textContent = '✓ Media added successfully!';
        document.body.appendChild(notification);
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 3000);
      } else {
        alert('Failed to add media to project. Please try again.');
      }
    } catch (error) {
      console.error('Error adding media to project:', error);
      alert('Error adding media. Please try again.');
    }
  };

  const updateSlideshow = (images: string[]) => {
    setSlideshowImages(images);
    // Save slideshow images to content system
    const updatedContent = {
      ...content,
      slideshow: images
    };
    setContent(updatedContent);
  };

  // Initialize slideshow from content if available
  useEffect(() => {
    if (content.slideshow && content.slideshow.length > 0) {
      setSlideshowImages(content.slideshow);
    }
  }, [content.slideshow]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, projectSlug?: string) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file, index) => {
      // File size check - 10MB limit
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Please use files smaller than 10MB.`);
        return;
      }

      // File type check
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert(`File "${file.name}" is not a valid image or video file.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const media: ProjectMedia = {
          id: `${Date.now()}-${index}`,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url: reader.result as string,
          caption: file.name,
        };

        if (projectSlug) {
          addMediaToProject(projectSlug, media);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const apply = () => {
    try {
      const parsed = JSON.parse(json);
      setContent(parsed);
      setError("");
    } catch (e) {
      setError("Invalid JSON");
    }
  };

  const download = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `site-content-${lang}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setJson(String(reader.result || ""));
    reader.readAsText(file);
  };

  const handleMigration = async () => {
    setIsMigrating(true);
    setMigrationStatus({ message: "Migrating data...", type: "info" });

    try {
      const result = await DataMigration.migrateFromLocalStorage();
      
      if (result.success) {
        setMigrationStatus({
          message: result.message,
          type: "success"
        });
        // Update data in interface
        await refreshProjects();
      } else {
        setMigrationStatus({
          message: result.message,
          type: "error"
        });
      }
    } catch (error) {
      setMigrationStatus({
        message: "An unexpected error occurred during migration",
        type: "error"
      });
      console.error("Migration error:", error);
    } finally {
      setIsMigrating(false);
    }
  };

  const clearMigrationStatus = () => {
    setMigrationStatus({ message: "", type: null });
  };

  const getLocalStorageInfo = () => {
    return DataMigration.getLocalStorageInfo();
  };

  // User management functions
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const allUsers = await UserService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      setUserMessage({ text: 'Error loading users', type: 'error' });
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      setUserMessage({ text: 'Please enter an email address', type: 'error' });
      return;
    }

    setLoadingUsers(true);
    try {
      const result = await UserService.addAdminByEmail(newAdminEmail.trim());
      setUserMessage({ text: result.message, type: result.success ? 'success' : 'error' });
      
      if (result.success) {
        setNewAdminEmail('');
        await loadUsers(); // Refresh the list
      }
    } catch (error) {
      setUserMessage({ text: 'Error adding admin', type: 'error' });
      console.error('Error adding admin:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRemoveAdmin = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to remove admin privileges from ${userEmail}?`)) {
      return;
    }

    setLoadingUsers(true);
    try {
      const result = await UserService.removeAdminRole(userId);
      setUserMessage({ text: result.message, type: result.success ? 'success' : 'error' });
      
      if (result.success) {
        await loadUsers(); // Refresh the list
      }
    } catch (error) {
      setUserMessage({ text: 'Error removing admin privileges', type: 'error' });
      console.error('Error removing admin:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const clearUserMessage = () => {
    setUserMessage({ text: '', type: null });
  };

  // Category management functions
  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const allCategories = await CategoryService.getAll();
      setCategories(allCategories);
    } catch (error) {
      setCategoryMessage({ text: 'Error loading categories', type: 'error' });
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      setCategoryMessage({ text: 'Please enter a category name', type: 'error' });
      return;
    }

    setLoadingCategories(true);
    try {
      const result = await CategoryService.create({
        name: newCategory.name.trim(),
        description: newCategory.description.trim() || undefined
      });
      
      if (result) {
        setCategoryMessage({ text: 'Category added successfully', type: 'success' });
        setNewCategory({ name: '', description: '' });
        await loadCategories();
      } else {
        setCategoryMessage({ text: 'Failed to add category', type: 'error' });
      }
    } catch (error) {
      setCategoryMessage({ text: 'Error adding category', type: 'error' });
      console.error('Error adding category:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      setCategoryMessage({ text: 'Please enter a category name', type: 'error' });
      return;
    }

    setLoadingCategories(true);
    try {
      const result = await CategoryService.update(editingCategory.id, {
        name: editingCategory.name.trim(),
        description: editingCategory.description?.trim() || undefined
      });
      
      if (result) {
        setCategoryMessage({ text: 'Category updated successfully', type: 'success' });
        setEditingCategory(null);
        await loadCategories();
      } else {
        setCategoryMessage({ text: 'Failed to update category', type: 'error' });
      }
    } catch (error) {
      setCategoryMessage({ text: 'Error updating category', type: 'error' });
      console.error('Error updating category:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete the category "${categoryName}"? Projects using this category will become uncategorized.`)) {
      return;
    }

    setLoadingCategories(true);
    try {
      const result = await CategoryService.delete(categoryId);
      
      if (result) {
        setCategoryMessage({ text: 'Category deleted successfully', type: 'success' });
        await loadCategories();
      } else {
        setCategoryMessage({ text: 'Failed to delete category', type: 'error' });
      }
    } catch (error) {
      setCategoryMessage({ text: 'Error deleting category', type: 'error' });
      console.error('Error deleting category:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const clearCategoryMessage = () => {
    setCategoryMessage({ text: '', type: null });
  };

  // Load users when the users tab is active
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  // Load categories when the categories tab is active
  useEffect(() => {
    if (activeTab === 'categories') {
      loadCategories();
    }
  }, [activeTab]);

  // Load categories for project form when projects tab is active
  useEffect(() => {
    if (activeTab === 'projects') {
      loadProjectCategories();
    }
  }, [activeTab]);

  const loadProjectCategories = async () => {
    setLoadingProjectCategories(true);
    try {
      const allCategories = await CategoryService.getAll();
      setProjectCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories for project form:', error);
    } finally {
      setLoadingProjectCategories(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <User className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <div className="text-sm text-gray-500">Language: {lang === 'ar' ? 'العربية' : 'English'}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
          
          <nav className="flex space-x-8">
            {[
              { id: "projects", label: "Projects", icon: "📁" },
              { id: "featured", label: "Featured Projects", icon: "⭐" },
              { id: "categories", label: "Categories", icon: "🏷️" },
              { id: "slideshow", label: "Slideshow", icon: "🖼️" },
              { id: "content", label: "Content", icon: "📝" },
              { id: "media", label: "Media", icon: "🎬" },
              { id: "social", label: "Social Links", icon: "🔗" },
              { id: "users", label: "Users", icon: "👥" },
              { id: "migration", label: "Data Migration", icon: "📦" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Project</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={newProject.name || ""}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="border rounded-md px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Slug (URL)"
                  value={newProject.slug || ""}
                  onChange={(e) => setNewProject({...newProject, slug: e.target.value})}
                  className="border rounded-md px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Duration"
                  value={newProject.duration || ""}
                  onChange={(e) => setNewProject({...newProject, duration: e.target.value})}
                  className="border rounded-md px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={newProject.location || ""}
                  onChange={(e) => setNewProject({...newProject, location: e.target.value})}
                  className="border rounded-md px-3 py-2"
                />
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newProject.category_id || ""}
                    onChange={(e) => setNewProject({...newProject, category_id: e.target.value || undefined})}
                    className="border rounded-md px-3 py-2"
                    disabled={loadingProjectCategories}
                  >
                    <option value="">Select Category (Optional)</option>
                    {projectCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {loadingProjectCategories && (
                    <p className="text-xs text-gray-500 mt-1">Loading categories...</p>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          alert('File is too large. Please use files smaller than 10MB.');
                          return;
                        }
                        setNewProjectCoverFile(file);
                      }
                    }}
                    className="border rounded-md px-3 py-2"
                  />
                  {newProjectCoverFile && (
                    <p className="text-xs text-green-600 mt-1">✓ {newProjectCoverFile.name}</p>
                  )}
                </div>
                <button
                  onClick={addProject}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-md text-white ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isLoading ? 'Adding...' : 'Add Project'}
                </button>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Existing Projects</h2>
              <div className="space-y-4">
                {content.projects.map((project) => (
                  <div key={project.slug} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{project.name}</h3>
                        <p className="text-sm text-gray-600">{project.slug} • {project.duration}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingProject(project)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProject(project.slug)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    {/* Enhanced Media Manager */}
                    <div className="mt-4">
                      <EnhancedMediaManager
                        projectSlug={project.slug}
                        gallery={project.gallery || []}
                        onUpdate={(newGallery) => {
                          const updatedContent = {
                            ...content,
                            projects: content.projects.map(p => 
                              p.slug === project.slug 
                                ? { ...p, gallery: newGallery }
                                : p
                            )
                          };
                          setContent(updatedContent);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "featured" && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl">⭐</span>
              <h2 className="text-xl font-semibold">Featured Projects Management</h2>
            </div>
            
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">📌 About Featured Projects</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Featured projects will be displayed prominently on the homepage</li>
                  <li>• You can feature up to 6 projects at a time for optimal display</li>
                  <li>• Featured projects appear before regular projects in the portfolio section</li>
                  <li>• Toggle the star to feature/unfeature projects</li>
                </ul>
              </div>

              {/* Featured Projects Count */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="text-yellow-800 font-medium">Featured Projects</div>
                  <div className="text-yellow-600 text-lg">
                    {content.projects.filter(p => p.featured).length} / 6
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-gray-800 font-medium">Total Projects</div>
                  <div className="text-gray-600 text-lg">{content.projects.length}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-green-800 font-medium">Available Slots</div>
                  <div className="text-green-600 text-lg">
                    {Math.max(0, 6 - content.projects.filter(p => p.featured).length)}
                  </div>
                </div>
              </div>

              {/* Projects List */}
              <div>
                <h3 className="font-medium mb-4">All Projects</h3>
                {content.projects.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                    <div className="text-6xl mb-4">📁</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h4>
                    <p className="text-gray-600">Create projects first in the Projects tab to feature them here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {content.projects.map((project) => {
                      const isFeatured = project.featured || false;
                      const featuredCount = content.projects.filter(p => p.featured).length;
                      const canFeature = featuredCount < 6;
                      
                      return (
                        <div key={project.slug} className={`border rounded-lg p-4 ${
                          isFeatured ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'
                        }`}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                              <img
                                src={project.coverUrl}
                                alt={project.name}
                                className="w-16 h-16 object-cover rounded border"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                              <div>
                                <div className="flex items-center space-x-2">
                                  {isFeatured && <span className="text-yellow-500">⭐</span>}
                                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                                  {isFeatured && (
                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                      Featured
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p>Slug: {project.slug}</p>
                                  <p>Duration: {project.duration}</p>
                                  {project.location && <p>Location: {project.location}</p>}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={async () => {
                                  const newFeaturedStatus = !isFeatured;
                                  
                                  // Check if trying to feature when already at limit
                                  if (newFeaturedStatus && !canFeature) {
                                    alert('You can only feature up to 6 projects. Please unfeature another project first.');
                                    return;
                                  }
                                  
                                  try {
                                    // Update in database
                                    const success = await ProjectService.updateFeatured(project.slug, newFeaturedStatus);
                                    
                                    if (success) {
                                      // Update local content
                                      const updatedContent = {
                                        ...content,
                                        projects: content.projects.map(p => 
                                          p.slug === project.slug 
                                            ? { ...p, featured: newFeaturedStatus }
                                            : p
                                        )
                                      };
                                      setContent(updatedContent);
                                      
                                      // Show success notification
                                      const notification = document.createElement('div');
                                      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
                                      notification.textContent = newFeaturedStatus 
                                        ? `✓ "${project.name}" is now featured!`
                                        : `✓ "${project.name}" is no longer featured.`;
                                      document.body.appendChild(notification);
                                      setTimeout(() => {
                                        document.body.removeChild(notification);
                                      }, 3000);
                                    } else {
                                      alert('Failed to update project featured status. Please try again.');
                                    }
                                  } catch (error) {
                                    console.error('Error updating featured status:', error);
                                    alert('Error updating project. Please try again.');
                                  }
                                }}
                                disabled={!isFeatured && !canFeature}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                                  isFeatured 
                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                    : canFeature
                                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                }`}
                                title={!isFeatured && !canFeature ? 'Maximum 6 featured projects allowed' : ''}
                              >
                                <span className={isFeatured ? 'text-yellow-500' : 'text-gray-400'}>
                                  {isFeatured ? '⭐' : '☆'}
                                </span>
                                <span className="text-sm">
                                  {isFeatured ? 'Featured' : 'Feature'}
                                </span>
                              </button>
                              
                              <a
                                href={`/projects/${project.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm px-3 py-2 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors"
                              >
                                👁️ Preview
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Quick Actions */}
              <div className="border-t pt-6">
                <h4 className="font-medium mb-3">Quick Actions</h4>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      if (confirm('This will remove all featured status from projects. Continue?')) {
                        // Update all projects to remove featured status
                        const promises = content.projects
                          .filter(p => p.featured)
                          .map(p => ProjectService.updateFeatured(p.slug, false));
                        
                        Promise.all(promises).then(() => {
                          const updatedContent = {
                            ...content,
                            projects: content.projects.map(p => ({ ...p, featured: false }))
                          };
                          setContent(updatedContent);
                          
                          const notification = document.createElement('div');
                          notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
                          notification.textContent = '✓ All projects unfeatured successfully!';
                          document.body.appendChild(notification);
                          setTimeout(() => {
                            document.body.removeChild(notification);
                          }, 3000);
                        }).catch((error) => {
                          console.error('Error clearing featured projects:', error);
                          alert('Error clearing featured projects. Please try again.');
                        });
                      }
                    }}
                    disabled={content.projects.filter(p => p.featured).length === 0}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear All Featured
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="px-4 py-2 text-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-md"
                  >
                    📁 Manage Projects
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl">🏷️</span>
              <h2 className="text-xl font-semibold">Category Management</h2>
            </div>
            
            {categoryMessage.type && (
              <Alert className={`mb-6 ${
                categoryMessage.type === 'success' ? 'border-green-500 bg-green-50' :
                'border-red-500 bg-red-50'
              }`}>
                <AlertDescription className={`${
                  categoryMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {categoryMessage.text}
                </AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCategoryMessage}
                  className="mt-2 text-xs"
                >
                  Close
                </Button>
              </Alert>
            )}

            <div className="space-y-6">
              {/* Add Category Section */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-4 flex items-center">
                  <span className="text-lg mr-2">➕</span>
                  Add New Category
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Category name (e.g., Villas, Hotels)"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCategory();
                      }
                    }}
                    className="w-full border rounded-md px-3 py-2"
                    disabled={loadingCategories}
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    rows={2}
                    className="w-full border rounded-md px-3 py-2"
                    disabled={loadingCategories}
                  />
                  <Button
                    onClick={handleAddCategory}
                    disabled={loadingCategories || !newCategory.name.trim()}
                    className="flex items-center space-x-2"
                  >
                    {loadingCategories ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <span>➕</span>
                        <span>Add Category</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Categories List */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Existing Categories</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadCategories}
                    disabled={loadingCategories}
                    className="flex items-center space-x-2"
                  >
                    {loadingCategories ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <span>🔄</span>
                    )}
                    <span>Refresh</span>
                  </Button>
                </div>

                {loadingCategories ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4 animate-spin">⏳</div>
                    <p className="text-gray-600">Loading categories...</p>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                    <div className="text-6xl mb-4">📦</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Categories Yet</h4>
                    <p className="text-gray-600">Create your first project category above.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Categories help organize your projects (e.g., Villas, Hotels, Commercial).
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-lg">🏷️</span>
                              <h4 className="font-medium text-gray-900">{category.name}</h4>
                            </div>
                            {category.description && (
                              <p className="text-sm text-gray-600 ml-7">{category.description}</p>
                            )}
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-2 ml-7">
                              <span>Created: {new Date(category.created_at || '').toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingCategory(category)}
                              disabled={loadingCategories}
                              className="text-blue-600 hover:text-blue-800 border-blue-200 hover:border-blue-300"
                            >
                              ✏️ Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id, category.name)}
                              disabled={loadingCategories}
                              className="text-red-600 hover:text-red-800 border-red-200 hover:border-red-300"
                            >
                              🗑️ Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* System Info */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Category Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-blue-800 font-medium">Total Categories</div>
                    <div className="text-blue-600 text-lg">{categories.length}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-green-800 font-medium">Categories with Description</div>
                    <div className="text-green-600 text-lg">
                      {categories.filter(c => c.description && c.description.trim()).length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">📘 Category Guidelines</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Categories help organize projects by type (Villas, Hotels, Commercial, etc.)</li>
                  <li>• Category names should be concise and descriptive</li>
                  <li>• You can assign categories to projects in the Projects tab</li>
                  <li>• Deleting a category will not delete projects, they'll just become uncategorized</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "slideshow" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Slideshow Management</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Slideshow Images
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {slideshowImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        onClick={() => {
                          const newImages = slideshowImages.filter((_, i) => i !== index);
                          updateSlideshow(newImages);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image Files
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (!files) return;
                    
                    Array.from(files).forEach((file) => {
                      const reader = new FileReader();
                      reader.onload = () => {
                        updateSlideshow([...slideshowImages, reader.result as string]);
                      };
                      reader.readAsDataURL(file);
                    });
                  }}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add New Image URL
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Image URL"
                    className="flex-1 border rounded-md px-3 py-2"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        updateSlideshow([...slideshowImages, e.currentTarget.value]);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Image URL"]') as HTMLInputElement;
                      if (input?.value) {
                        updateSlideshow([...slideshowImages, input.value]);
                        input.value = '';
                      }
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "content" && (
          <div className="space-y-6">
            {/* Site Branding */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="mr-2">🎆</span>
                Site Branding
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={content.copy.brandName}
                    onChange={(e) => {
                      const updatedContent = {
                        ...content,
                        copy: { ...content.copy, brandName: e.target.value }
                      };
                      setContent(updatedContent);
                    }}
                    onBlur={() => {
                      // Show save confirmation
                      const notification = document.createElement('div');
                      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
                      notification.textContent = '✓ Brand name saved successfully!';
                      document.body.appendChild(notification);
                      setTimeout(() => {
                        document.body.removeChild(notification);
                      }, 3000);
                    }}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="e.g., Villa Finishings"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Logo (Optional)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            alert('Logo file is too large. Please use files smaller than 5MB.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = () => {
                            const updatedContent = {
                              ...content,
                              siteSettings: { 
                                ...((content as any).siteSettings || {}), 
                                logoUrl: reader.result as string 
                              }
                            };
                            setContent(updatedContent);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full border rounded-md px-3 py-2"
                    />
                    <p className="text-xs text-gray-500">
                      Upload a logo to display next to your brand name. Recommended size: 120x40px or similar ratio.
                    </p>
                    {(content as any).siteSettings?.logoUrl && (
                      <div className="mt-2">
                        <img 
                          src={(content as any).siteSettings.logoUrl} 
                          alt="Site Logo" 
                          className="h-8 max-w-32 object-contain border rounded"
                        />
                        <button
                          onClick={() => {
                            const updatedContent = {
                              ...content,
                              siteSettings: { 
                                ...((content as any).siteSettings || {}), 
                                logoUrl: undefined 
                              }
                            };
                            setContent(updatedContent);
                          }}
                          className="mt-1 text-xs text-red-600 hover:text-red-800"
                        >
                          Remove Logo
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Favicon (Browser Tab Icon)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 1024 * 1024) {
                            alert('Favicon file is too large. Please use files smaller than 1MB.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = () => {
                            const updatedContent = {
                              ...content,
                              siteSettings: { 
                                ...((content as any).siteSettings || {}), 
                                faviconUrl: reader.result as string 
                              }
                            };
                            setContent(updatedContent);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full border rounded-md px-3 py-2"
                    />
                    <p className="text-xs text-gray-500">
                      Upload a small icon (16x16 or 32x32px) to display in browser tabs and bookmarks.
                    </p>
                    {(content as any).siteSettings?.faviconUrl && (
                      <div className="mt-2 flex items-center space-x-2">
                        <img 
                          src={(content as any).siteSettings.faviconUrl} 
                          alt="Site Favicon" 
                          className="w-4 h-4 object-contain border rounded"
                        />
                        <span className="text-xs text-gray-600">Current favicon</span>
                        <button
                          onClick={() => {
                            const updatedContent = {
                              ...content,
                              siteSettings: { 
                                ...((content as any).siteSettings || {}), 
                                faviconUrl: undefined 
                              }
                            };
                            setContent(updatedContent);
                          }}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="mr-2">🌅</span>
                Hero Section
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Title
                  </label>
                  <input
                    type="text"
                    value={content.copy.hero.title}
                    onChange={(e) => {
                      const updatedContent = {
                        ...content,
                        copy: { ...content.copy, hero: { ...content.copy.hero, title: e.target.value } }
                      };
                      setContent(updatedContent);
                    }}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="e.g., Premium Villa Finishings"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Subtitle
                  </label>
                  <textarea
                    value={content.copy.hero.subtitle}
                    onChange={(e) => {
                      const updatedContent = {
                        ...content,
                        copy: { ...content.copy, hero: { ...content.copy.hero, subtitle: e.target.value } }
                      };
                      setContent(updatedContent);
                    }}
                    rows={3}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="e.g., Transform your space with our expert finishing services..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={content.copy.hero.ctaPrimary}
                    onChange={(e) => {
                      const updatedContent = {
                        ...content,
                        copy: { ...content.copy, hero: { ...content.copy.hero, ctaPrimary: e.target.value } }
                      };
                      setContent(updatedContent);
                    }}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="e.g., Get Quote"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={content.copy.hero.ctaSecondary}
                    onChange={(e) => {
                      const updatedContent = {
                        ...content,
                        copy: { ...content.copy, hero: { ...content.copy.hero, ctaSecondary: e.target.value } }
                      };
                      setContent(updatedContent);
                    }}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="e.g., View Portfolio"
                  />
                </div>
              </div>
            </div>

            {/* Navigation & Sections */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="mr-2">📝</span>
                Site Sections
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Services Section Title
                  </label>
                  <input
                    type="text"
                    value={content.copy.services.title}
                    onChange={(e) => {
                      const updatedContent = {
                        ...content,
                        copy: { ...content.copy, services: { ...content.copy.services, title: e.target.value } }
                      };
                      setContent(updatedContent);
                    }}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="e.g., Our Services"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio Section Title
                  </label>
                  <input
                    type="text"
                    value={content.copy.portfolio.title}
                    onChange={(e) => {
                      const updatedContent = {
                        ...content,
                        copy: { ...content.copy, portfolio: { ...content.copy.portfolio, title: e.target.value } }
                      };
                      setContent(updatedContent);
                    }}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="e.g., Our Work"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Section Title
                  </label>
                  <input
                    type="text"
                    value={content.copy.contact.title}
                    onChange={(e) => {
                      const updatedContent = {
                        ...content,
                        copy: { ...content.copy, contact: { ...content.copy.contact, title: e.target.value } }
                      };
                      setContent(updatedContent);
                    }}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="e.g., Get In Touch"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    "View All Projects" Button Text
                  </label>
                  <input
                    type="text"
                    value={content.copy.portfolio.viewAll}
                    onChange={(e) => {
                      const updatedContent = {
                        ...content,
                        copy: { ...content.copy, portfolio: { ...content.copy.portfolio, viewAll: e.target.value } }
                      };
                      setContent(updatedContent);
                    }}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="e.g., View All Projects"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "media" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Media Library</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Media Files
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">All Media Files</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {content.projects.flatMap(p => (p.gallery || [])).map((media, index) => (
                    <div key={`${media.id}-${index}`} className="relative">
                      <div className="w-full h-24 bg-gray-100 rounded border flex items-center justify-center">
                        {media.type === 'video' ? '🎬 Video' : '🖼️ Image'}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 truncate">{media.caption || 'No caption'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "social" && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Social Media Links</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number (with country code)
                </label>
                <input
                  type="text"
                  value={content.socials.whatsapp?.replace('https://wa.me/', '') || ""}
                  onChange={(e) => {
                    const updatedContent = {
                      ...content,
                      socials: { 
                        ...content.socials, 
                        whatsapp: e.target.value ? `https://wa.me/${e.target.value}` : undefined 
                      }
                    };
                    setContent(updatedContent);
                  }}
                  placeholder="962791234567"
                  className="w-full border rounded-md px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">Example: 962791234567 (Jordan number)</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram Profile URL
                </label>
                <input
                  type="url"
                  value={content.socials.instagram || ""}
                  onChange={(e) => {
                    const updatedContent = {
                      ...content,
                      socials: { ...content.socials, instagram: e.target.value || undefined }
                    };
                    setContent(updatedContent);
                  }}
                  placeholder="https://instagram.com/yourhandle"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook Page URL
                </label>
                <input
                  type="url"
                  value={content.socials.facebook || ""}
                  onChange={(e) => {
                    const updatedContent = {
                      ...content,
                      socials: { ...content.socials, facebook: e.target.value || undefined }
                    };
                    setContent(updatedContent);
                  }}
                  placeholder="https://facebook.com/yourpage"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TikTok Profile URL
                </label>
                <input
                  type="url"
                  value={content.socials.tiktok || ""}
                  onChange={(e) => {
                    const updatedContent = {
                      ...content,
                      socials: { ...content.socials, tiktok: e.target.value || undefined }
                    };
                    setContent(updatedContent);
                  }}
                  placeholder="https://tiktok.com/@yourhandle"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">Preview</h3>
                <div className="flex space-x-4">
                  {content.socials.whatsapp && (
                    <a 
                      href={content.socials.whatsapp} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-green-600 hover:text-green-800"
                    >
                      <span>📱</span>
                      <span>WhatsApp</span>
                    </a>
                  )}
                  {content.socials.instagram && (
                    <a 
                      href={content.socials.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-pink-600 hover:text-pink-800"
                    >
                      <span>📷</span>
                      <span>Instagram</span>
                    </a>
                  )}
                  {content.socials.facebook && (
                    <a 
                      href={content.socials.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                      <span>👥</span>
                      <span>Facebook</span>
                    </a>
                  )}
                  {content.socials.tiktok && (
                    <a 
                      href={content.socials.tiktok} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-black hover:text-gray-800"
                    >
                      <span>🎵</span>
                      <span>TikTok</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Users className="h-6 w-6 text-indigo-600" />
              <h2 className="text-xl font-semibold">User Management</h2>
            </div>
            
            {userMessage.type && (
              <Alert className={`mb-6 ${
                userMessage.type === 'success' ? 'border-green-500 bg-green-50' :
                'border-red-500 bg-red-50'
              }`}>
                <AlertDescription className={`${
                  userMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {userMessage.text}
                </AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearUserMessage}
                  className="mt-2 text-xs"
                >
                  Close
                </Button>
              </Alert>
            )}

            <div className="space-y-6">
              {/* Add Admin Section */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Add New Admin
                </h3>
                <div className="flex space-x-3">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddAdmin();
                      }
                    }}
                    className="flex-1 border rounded-md px-3 py-2"
                    disabled={loadingUsers}
                  />
                  <Button
                    onClick={handleAddAdmin}
                    disabled={loadingUsers || !newAdminEmail.trim()}
                    className="flex items-center space-x-2"
                  >
                    {loadingUsers ? (
                      <>
                        <Users className="h-4 w-4 animate-spin" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        <span>Add Admin</span>
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Note: The user must sign up first before being granted admin privileges.
                </p>
              </div>

              {/* Users List */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">System Users</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadUsers}
                    disabled={loadingUsers}
                    className="flex items-center space-x-2"
                  >
                    {loadingUsers ? (
                      <Users className="h-4 w-4 animate-spin" />
                    ) : (
                      <Users className="h-4 w-4" />
                    )}
                    <span>Refresh</span>
                  </Button>
                </div>

                {loadingUsers ? (
                  <div className="text-center py-8">
                    <Users className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Loading users...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h4>
                    <p className="text-gray-600">There are no users with admin privileges yet.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Add admin users by entering their email addresses above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {users.map((userInfo) => (
                      <div key={userInfo.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              userInfo.role === 'admin' ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                            <div>
                              <p className="font-medium text-gray-900">{userInfo.email}</p>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  userInfo.role === 'admin' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {userInfo.role === 'admin' ? '👑 Admin' : '👤 User'}
                                </span>
                                <span>•</span>
                                <span>Joined {new Date(userInfo.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {userInfo.role === 'admin' && userInfo.id !== user?.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveAdmin(userInfo.id, userInfo.email)}
                                disabled={loadingUsers}
                                className="text-red-600 hover:text-red-800 border-red-200 hover:border-red-300"
                              >
                                Remove Admin
                              </Button>
                            )}
                            {userInfo.id === user?.id && (
                              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* System Info */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">System Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-blue-800 font-medium">Total Users</div>
                    <div className="text-blue-600 text-lg">{users.length}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-green-800 font-medium">Admins</div>
                    <div className="text-green-600 text-lg">
                      {users.filter(u => u.role === 'admin').length}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-gray-800 font-medium">Regular Users</div>
                    <div className="text-gray-600 text-lg">
                      {users.filter(u => u.role !== 'admin').length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">📋 Instructions</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Only users who have already signed up can be granted admin privileges</li>
                  <li>• Admin users can access this dashboard and manage all content</li>
                  <li>• You cannot remove your own admin privileges</li>
                  <li>• Make sure there is always at least one admin user in the system</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "migration" && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Database className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Data Migration</h2>
            </div>
            
            {migrationStatus.type && (
              <Alert className={`mb-6 ${
                migrationStatus.type === 'success' ? 'border-green-500 bg-green-50' :
                migrationStatus.type === 'error' ? 'border-red-500 bg-red-50' :
                'border-blue-500 bg-blue-50'
              }`}>
                <AlertDescription className={`${
                  migrationStatus.type === 'success' ? 'text-green-800' :
                  migrationStatus.type === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {migrationStatus.message}
                </AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearMigrationStatus}
                  className="mt-2 text-xs"
                >
                  Close
                </Button>
              </Alert>
            )}

            <div className="space-y-6">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-3">Local Data Information</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  {(() => {
                    const info = getLocalStorageInfo();
                    return (
                      <div>
                        <p><strong>Data exists:</strong> {info.hasData ? 'Yes ✅' : 'No ❌'}</p>
                        <p><strong>Number of projects:</strong> {info.projectsCount}</p>
                        <p><strong>Data sections:</strong> {info.contentKeys.join(', ') || 'None'}</p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">⚠️ Important Notice</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• All data will be migrated from local storage to Supabase database</li>
                    <li>• A backup of local data will be created automatically</li>
                    <li>• Make sure you have internet connection before starting migration</li>
                    <li>• The process may take several minutes depending on data amount</li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleMigration}
                    disabled={isMigrating || !getLocalStorageInfo().hasData}
                    className="flex items-center space-x-2"
                  >
                    {isMigrating && <Database className="h-4 w-4 animate-spin" />}
                    <span>{isMigrating ? 'Migrating...' : 'Start Data Migration'}</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      if (confirm('Are you sure you want to clear local data? Make sure migration is complete first.')) {
                        DataMigration.clearLocalStorageData();
                        setMigrationStatus({
                          message: 'Local data cleared successfully',
                          type: 'success'
                        });
                      }
                    }}
                    disabled={!getLocalStorageInfo().hasData}
                  >
                    Clear Local Data
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Migration Steps:</h4>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li>1. Check for data existence in local storage</li>
                  <li>2. Create backup of local data</li>
                  <li>3. Migrate projects to Supabase</li>
                  <li>4. Migrate general content and settings</li>
                  <li>5. Verify operation success</li>
                  <li>6. Clear local data (optional)</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Edit Category: {editingCategory.name}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  placeholder="Category name"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Category description (optional)"
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                  rows={3}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loadingCategories}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCategory}
                disabled={loadingCategories}
                className={`px-4 py-2 rounded-md text-white ${
                  loadingCategories 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {loadingCategories ? 'Updating...' : 'Update Category'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Project Edit Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit Project: {editingProject.name}</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                  className="border rounded-md px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Duration"
                  value={editingProject.duration}
                  onChange={(e) => setEditingProject({...editingProject, duration: e.target.value})}
                  className="border rounded-md px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={editingProject.location || ""}
                  onChange={(e) => setEditingProject({...editingProject, location: e.target.value})}
                  className="border rounded-md px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Cover Image URL"
                  value={editingProject.coverUrl}
                  onChange={(e) => setEditingProject({...editingProject, coverUrl: e.target.value})}
                  className="border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scope Items (one per line)</label>
                <textarea
                  value={editingProject.scopeItems?.join('\n') || ""}
                  onChange={(e) => setEditingProject({
                    ...editingProject, 
                    scopeItems: e.target.value.split('\n').filter(item => item.trim())
                  })}
                  rows={4}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={editingProject.tags?.join(', ') || ""}
                  onChange={(e) => setEditingProject({
                    ...editingProject, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => updateProject(editingProject.slug, editingProject)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminPageContent />
    </ProtectedRoute>
  );
}

