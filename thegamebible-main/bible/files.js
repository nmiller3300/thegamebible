/* bible/files.js — Supabase Storage for 3D model files
 * Replaces the IndexedDB prototype. Files upload to and download from
 * the Supabase 'models' storage bucket so both users can access them.
 */
(function () {

  const ALLOWED = { fbx:true, glb:true, obj:true, blend:true };
  const EXTENSIONS = Object.keys(ALLOWED);
  const ACCEPT_ATTR = EXTENSIONS.map((e) => '.' + e).join(',');

  function extOf(name) {
    const m = (name || '').toLowerCase().match(/\.([a-z0-9]+)$/);
    return m ? m[1] : '';
  }
  function isAllowed(file) { return EXTENSIONS.includes(extOf(file.name)); }
  function formatSize(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) return '—';
    if (bytes < 1024)            return bytes + ' B';
    if (bytes < 1024 * 1024)     return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }

  async function storeFile(file, who) {
    if (!file) throw new Error('No file');
    if (!isAllowed(file)) throw new Error('Unsupported type. Allowed: ' + EXTENSIONS.join(', ').toUpperCase());
    const id = 'model_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    const path = id + '.' + extOf(file.name);
    const db = window.YSTC.db;
    const { error } = await db.storage.from('models').upload(path, file, { contentType: file.type || 'application/octet-stream' });
    if (error) throw new Error('Upload failed: ' + error.message);
    return {
      id: path,
      fileName: file.name,
      mimeType: file.type || '',
      size: file.size,
      uploadedBy: who || '—',
      uploadedAt: new Date().toISOString(),
      path,
    };
  }

  async function downloadStored(meta) {
    if (!meta || !meta.path) throw new Error('No file path');
    const db = window.YSTC.db;
    const { data, error } = await db.storage.from('models').download(meta.path);
    if (error) throw new Error('Download failed: ' + error.message);
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = meta.fileName || meta.path;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function deleteBlob(path) {
    if (!path) return;
    const db = window.YSTC.db;
    await db.storage.from('models').remove([path]).catch(console.error);
  }

  // Legacy compat — the bestiary section calls getBlob for preview
  async function getBlob(path) {
    if (!path) return null;
    const db = window.YSTC.db;
    const { data } = await db.storage.from('models').download(path);
    return data || null;
  }

  window.YSTC_FILES = {
    EXTENSIONS, ACCEPT_ATTR,
    isAllowed, extOf, formatSize,
    storeFile, downloadStored, deleteBlob, getBlob,
  };
})();
