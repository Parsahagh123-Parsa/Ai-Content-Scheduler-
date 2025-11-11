'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Image,
  Video,
  FileText,
  Search,
  Filter,
  Grid,
  List,
  Download,
  Upload,
  Trash2,
  Edit,
  Tag,
  Calendar,
  Folder,
  Star,
} from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'template';
  url: string;
  thumbnail?: string;
  size: number;
  tags: string[];
  folder: string;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
}

/**
 * ContentLibrary Component
 * 
 * Professional asset management system for content creators:
 * - Upload and organize media assets
 * - Search and filter capabilities
 * - Folder organization
 * - Favorites system
 * - Bulk operations
 * - Preview and download
 */
export default function ContentLibrary() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  const folders = ['all', 'images', 'videos', 'templates', 'documents'];
  const types = ['all', 'image', 'video', 'document', 'template'];

  useEffect(() => {
    fetchAssets();
  }, [selectedFolder, selectedType]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/content-library?folder=${selectedFolder}&type=${selectedType}`);
      if (response.ok) {
        const data = await response.json();
        setAssets(data.assets || []);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/content-library/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        fetchAssets();
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const handleDelete = async (assetId: string) => {
    try {
      await fetch(`/api/content-library/${assetId}`, {
        method: 'DELETE',
      });
      fetchAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-6 h-6" />;
      case 'video':
        return <Video className="w-6 h-6" />;
      case 'document':
        return <FileText className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Folder className="w-10 h-10" />
                Content Library
              </h1>
              <p className="text-blue-200">Manage and organize your content assets</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-bold hover:scale-105 transition-all cursor-pointer flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && handleUpload(e.target.files)}
                />
              </label>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white/20 transition-all"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5 text-white" /> : <Grid className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {folders.map(folder => (
                <option key={folder} value={folder} className="bg-gray-800">
                  {folder.charAt(0).toUpperCase() + folder.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {types.map(type => (
                <option key={type} value={type} className="bg-gray-800">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Assets Grid/List */}
        {loading ? (
          <div className="text-center text-white text-xl py-12">Loading assets...</div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/60 text-xl">No assets found</p>
            <p className="text-white/40 mt-2">Upload your first asset to get started</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-4'}>
            {filteredAssets.map((asset) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all ${
                  selectedAssets.includes(asset.id) ? 'ring-2 ring-pink-500' : ''
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="relative aspect-video bg-white/5">
                      {asset.thumbnail ? (
                        <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {getAssetIcon(asset.type)}
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-2">
                        {asset.favorite && <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="p-1 bg-red-500/80 rounded-lg hover:bg-red-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-1 truncate">{asset.name}</h3>
                      <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                        <span>{formatFileSize(asset.size)}</span>
                        <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {asset.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-pink-500/20 rounded text-xs text-pink-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center">
                      {getAssetIcon(asset.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{asset.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>{formatFileSize(asset.size)}</span>
                        <span>{asset.folder}</span>
                        <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
                        <Download className="w-5 h-5 text-white" />
                      </button>
                      <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
                        <Edit className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(asset.id)}
                        className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30"
                      >
                        <Trash2 className="w-5 h-5 text-red-300" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

