import React, { useState, useEffect } from 'react';
import { Upload, File, Folder, Search, Download, Trash2, Eye, Lock, Users, Tag, Filter, AlertCircle, CheckCircle, X } from 'lucide-react';

const AzureFileStorageSystem = () => {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [uploadProgress, setUploadProgress] = useState(null);
  const [notification, setNotification] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [tags, setTags] = useState('');

  // Simulated Azure AD authentication
  const mockUsers = [
    { id: '1', email: 'admin@company.com', role: 'admin', name: 'Admin User' },
    { id: '2', email: 'user@company.com', role: 'user', name: 'Standard User' },
    { id: '3', email: 'viewer@company.com', role: 'viewer', name: 'Viewer User' }
  ];

  // Initialize with localStorage or demo data
  useEffect(() => {
    setUser(mockUsers[0]);
    // Load files from localStorage if available
    const storedFiles = localStorage.getItem('azureFiles');
    if (storedFiles) {
      // Dates are stored as strings, so convert them back
      const parsed = JSON.parse(storedFiles).map(f => ({
        ...f,
        uploadedAt: new Date(f.uploadedAt)
      }));
      setFiles(parsed);
    } else {
      const demoFiles = [
        {
          id: '1',
          name: 'Q4_Report.pdf',
          size: 2456789,
          type: 'application/pdf',
          uploadedBy: 'Admin User',
          uploadedAt: new Date('2024-11-15'),
          tags: ['reports', 'finance', 'q4'],
          folder: null,
          url: '#'
        },
        {
          id: '2',
          name: 'Project_Specs.docx',
          size: 1234567,
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          uploadedBy: 'Standard User',
          uploadedAt: new Date('2024-11-20'),
          tags: ['projects', 'documentation'],
          folder: 'docs',
          url: '#'
        },
        {
          id: '3',
          name: 'Logo.png',
          size: 456789,
          type: 'image/png',
          uploadedBy: 'Admin User',
          uploadedAt: new Date('2024-11-22'),
          tags: ['assets', 'branding'],
          folder: 'images',
          url: '#'
        },
        {
          id: '4',
          name: 'Budget_2024.xlsx',
          size: 987654,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          uploadedBy: 'Admin User',
          uploadedAt: new Date('2024-11-25'),
          tags: ['finance', 'budget'],
          folder: null,
          url: '#'
        }
      ];
      setFiles(demoFiles);
      localStorage.setItem('azureFiles', JSON.stringify(demoFiles));
    }
    setFolders([
      { id: 'docs', name: 'Documents', createdAt: new Date('2024-11-01') },
      { id: 'images', name: 'Images', createdAt: new Date('2024-11-01') },
      { id: 'reports', name: 'Reports', createdAt: new Date('2024-11-01') }
    ]);
  }, []);

  // Save files to localStorage whenever files change
  useEffect(() => {
    localStorage.setItem('azureFiles', JSON.stringify(files));
  }, [files]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Simulated file upload to Azure Blob Storage
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!canUpload()) {
      showNotification('You do not have permission to upload files', 'error');
      return;
    }

    setShowUploadModal(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate Azure Blob Storage upload
    setTimeout(() => {
      const newFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedBy: user.name,
        uploadedAt: new Date(),
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        folder: currentFolder,
        url: '#'
      };

      setFiles(prev => {
        const updated = [...prev, newFile];
        // localStorage update is handled by useEffect above
        return updated;
      });
      setUploadProgress(null);
      setShowUploadModal(false);
      setTags('');
      showNotification(`File "${file.name}" uploaded successfully`);
    }, 2200);
  };

  const handleDeleteFile = (fileId) => {
    if (!canDelete()) {
      showNotification('You do not have permission to delete files', 'error');
      return;
    }

    const file = files.find(f => f.id === fileId);
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      // localStorage update is handled by useEffect above
      return updated;
    });
    showNotification(`File "${file.name}" deleted successfully`);
  };

  const handleDownload = (file) => {
    // If file.url is a real URL, use that. For demo, create a dummy file.
    if (file.url && file.url !== '#') {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification(`Downloading "${file.name}"...`);
      return;
    }
    // Demo: download a dummy file with the correct name and type
    const blob = new Blob([
      `This is a demo file for ${file.name}. In production, this would download the real file from Azure.`
    ], { type: file.type || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification(`Downloading "${file.name}"...`);
  };

  const handleViewFile = (file) => {
    setSelectedFile(file);
  };

  // Role-based access control
  const canUpload = () => ['admin', 'user'].includes(user?.role);
  const canDelete = () => user?.role === 'admin';
  const canView = () => true; // All authenticated users can view

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word')) return '📝';
    if (type.includes('excel') || type.includes('sheet')) return '📊';
    return '📎';
  };

  const filteredFiles = files.filter(file => {
    const matchesFolder = currentFolder ? file.folder === currentFolder : file.folder === null;
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = filterTag ? file.tags.includes(filterTag) : true;
    return matchesFolder && matchesSearch && matchesTag;
  });

  const allTags = [...new Set(files.flatMap(f => f.tags))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Folder className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Azure File Storage</h1>
                <p className="text-xs text-gray-500">Cloud-based secure storage</p>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {user.role.toUpperCase()}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name.charAt(0)}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Uploading to Azure Blob Storage</h3>
            <div className="mb-4">
              <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">{uploadProgress}%</p>
            </div>
            <p className="text-xs text-gray-500 text-center">Encrypting and transferring to Azure...</p>
          </div>
        </div>
      )}

      {/* File Details Modal */}
      {/* File Details Below Files Grid */}
      {selectedFile && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-auto border border-blue-200 mt-8">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold">File Details</h3>
              <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <span className="text-4xl">{getFileIcon(selectedFile.type)}</span>
                <div>
                  <p className="font-medium text-lg">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Uploaded By</p>
                  <p className="text-sm font-medium">{selectedFile.uploadedBy}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Upload Date</p>
                  <p className="text-sm font-medium">{selectedFile.uploadedAt.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">File Type</p>
                  <p className="text-sm font-medium">{selectedFile.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Storage Location</p>
                  <p className="text-sm font-medium">Azure Blob Storage</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedFile.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => handleDownload(selectedFile)}
                  className="file-action-btn download flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                {canDelete() && (
                  <button
                    onClick={() => {
                      handleDeleteFile(selectedFile.id);
                      setSelectedFile(null);
                    }}
                    className="file-action-btn delete px-4 py-2 bg-red-600 text-white rounded-lg flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Folder className="w-5 h-5" />
                Folders
              </h2>
              
              <button
                onClick={() => setCurrentFolder(null)}
                className={`w-full text-left px-3 py-2 rounded-lg mb-2 transition-colors ${
                  currentFolder === null ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                All Files
              </button>
              
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => setCurrentFolder(folder.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg mb-2 transition-colors ${
                    currentFolder === folder.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  📁 {folder.name}
                </button>
              ))}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Filter by Tag
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setFilterTag('')}
                    className={`w-full text-left px-2 py-1 rounded text-sm ${
                      filterTag === '' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    All
                  </button>
                  {allTags.map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFilterTag(tag)}
                      className={`w-full text-left px-2 py-1 rounded text-sm ${
                        filterTag === tag ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Permissions
                </h3>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${canView() ? 'text-green-500' : 'text-gray-300'}`} />
                    View Files
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${canUpload() ? 'text-green-500' : 'text-gray-300'}`} />
                    Upload Files
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${canDelete() ? 'text-green-500' : 'text-gray-300'}`} />
                    Delete Files
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Actions Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search files and tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {canUpload() && (
                  <label className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 cursor-pointer flex items-center gap-2 transition-all">
                    <Upload className="w-5 h-5" />
                    Upload File
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {canUpload() && (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Add tags (comma-separated)..."
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{files.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatFileSize(files.reduce((acc, f) => acc + f.size, 0))}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">Folders</p>
                <p className="text-2xl font-bold text-gray-900">{folders.length}</p>
              </div>
            </div>

            {/* Files Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-4">
                {currentFolder ? folders.find(f => f.id === currentFolder)?.name : 'All Files'}
                <span className="text-sm text-gray-500 ml-2">({filteredFiles.length} files)</span>
              </h2>

              {filteredFiles.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <File className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No files found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFiles.map(file => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{getFileIcon(file.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{file.name}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span>{file.uploadedAt.toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{file.uploadedBy}</span>
                          </div>
                          {file.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {file.tags.map((tag, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewFile(file)}
                          className="file-action-btn view p-2 text-gray-600 rounded-lg"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(file)}
                          className="file-action-btn download p-2 text-blue-600 rounded-lg"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {canDelete() && (
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="file-action-btn delete p-2 text-red-600 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Connected to Azure Cloud
            </div>
            <div className="flex items-center gap-4">
              <span>Encrypted with AES-256</span>
              <span>•</span>
              <span>Azure AD Authentication</span>
              <span>•</span>
              <span>RBAC Enabled</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AzureFileStorageSystem;