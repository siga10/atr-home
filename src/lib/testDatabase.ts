// ملف اختبار الاتصال بقاعدة البيانات
import { ProjectService, CategoryService, ContentService } from '@/lib/dataService';

export async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    console.log('📋 Testing projects...');
    const projects = await ProjectService.getAll();
    console.log(`✅ Projects loaded: ${projects.length} projects`);

    console.log('📂 Testing categories...');
    const categories = await CategoryService.getAll();
    console.log(`✅ Categories loaded: ${categories.length} categories`);

    console.log('📄 Testing content...');
    const content = await ContentService.getAll();
    console.log(`✅ Content loaded: ${Object.keys(content).length} content items`);

    console.log('✏️ Testing content creation...');
    const testContent = { test: 'database connection working' };
    const saved = await ContentService.set('test-connection', testContent);
    if (saved) {
      console.log('✅ Test content saved successfully');
      const retrieved = await ContentService.get('test-connection');
      if (retrieved?.test === 'database connection working') {
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

export async function testProjectCreation() {
  console.log('🏗️ Testing project creation...');
  
  try {
    const testProject = {
      slug: 'test-project-' + Date.now(),
      name: 'Test Project',
      coverUrl: '/test-image.jpg',
      images: ['/test1.jpg', '/test2.jpg'],
      gallery: [],
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
      console.log('✅ Test project created:', created.slug);

      const retrieved = await ProjectService.getBySlug(created.slug);
      if (retrieved) {
        console.log('✅ Test project retrieved');
        if (created.id) {
          const deleted = await ProjectService.delete(created.id);
          console.log(deleted ? '✅ Project deleted' : '❌ Project deletion failed');
        }
      } else {
        console.log('❌ Retrieval failed');
      }
    } else {
      console.log('❌ Creation failed');
    }

    return true;
  } catch (error) {
    console.error('❌ Project creation test failed:', error);
    return false;
  }
}

export async function runAllTests() {
  console.log('🚀 Running all DB tests...');
  const connectionTest = await testDatabaseConnection();
  const projectTest = await testProjectCreation();
  if (connectionTest && projectTest) {
    console.log('🎉 All tests passed!');
    return true;
  } else {
    console.log('❌ Some tests failed');
    return false;
  }
}
