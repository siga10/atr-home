// ملف اختبار الاتصال بقاعدة البيانات
import { ProjectService, CategoryService, ContentService } from './dataService';

export async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // اختبار جلب المشاريع
    console.log('📋 Testing projects...');
    const projects = await ProjectService.getAll();
    console.log(`✅ Projects loaded: ${projects.length} projects`);
    
    // اختبار جلب الفئات
    console.log('📂 Testing categories...');
    const categories = await CategoryService.getAll();
    console.log(`✅ Categories loaded: ${categories.length} categories`);
    
    // اختبار جلب المحتوى
    console.log('📄 Testing content...');
    const content = await ContentService.getAll();
    console.log(`✅ Content loaded: ${Object.keys(content).length} content items`);
    
    // اختبار إنشاء محتوى تجريبي
    console.log('✏️ Testing content creation...');
    const testContent = { test: 'database connection working' };
    const saved = await ContentService.set('test-connection', testContent);
    if (saved) {
      console.log('✅ Test content saved successfully');
      
      // اختبار جلب المحتوى المحفوظ
      const retrieved = await ContentService.get('test-connection');
      if (retrieved && retrieved.test === 'database connection working') {
        console.log('✅ Test content retrieved successfully');
      } else {
        console.log('❌ Test content retrieval failed');
      }
    } else {
      console.log('❌ Test content save failed');
    }
    
    console.log('🎉 Database connection test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

// دالة لاختبار إنشاء مشروع تجريبي
export async function testProjectCreation() {
  console.log('🏗️ Testing project creation...');
  
  try {
    const testProject = {
      slug: 'test-project-' + Date.now(),
      name: 'Test Project',
      coverUrl: '/test-image.jpg',
      images: ['/test1.jpg', '/test2.jpg'],
      gallery: [
        { id: '1', type: 'image' as const, url: '/test1.jpg', caption: 'Test image 1' },
        { id: '2', type: 'image' as const, url: '/test2.jpg', caption: 'Test image 2' }
      ],
      scopeItems: ['Test scope item 1', 'Test scope item 2'],
      duration: '1 month',
      location: 'Test Location',
      tags: ['test', 'demo'],
      content: 'This is a test project',
      category_id: undefined,
      featured: false
    };
    
    const created = await ProjectService.create(testProject);
    if (created) {
      console.log('✅ Test project created successfully:', created.slug);
      
      // اختبار جلب المشروع المنشأ
      const retrieved = await ProjectService.getBySlug(created.slug);
      if (retrieved) {
        console.log('✅ Test project retrieved successfully');
        
        // حذف المشروع التجريبي
        if (created.id) {
          const deleted = await ProjectService.delete(created.id);
          if (deleted) {
            console.log('✅ Test project deleted successfully');
          } else {
            console.log('❌ Test project deletion failed');
          }
        }
      } else {
        console.log('❌ Test project retrieval failed');
      }
    } else {
      console.log('❌ Test project creation failed');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Project creation test failed:', error);
    return false;
  }
}

// دالة شاملة لاختبار جميع العمليات
export async function runAllTests() {
  console.log('🚀 Starting comprehensive database tests...');
  
  const connectionTest = await testDatabaseConnection();
  const projectTest = await testProjectCreation();
  
  if (connectionTest && projectTest) {
    console.log('🎉 All tests passed! Database is working correctly.');
    return true;
  } else {
    console.log('❌ Some tests failed. Please check the database configuration.');
    return false;
  }
}
