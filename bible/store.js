/* bible/store.js — Supabase-backed store */
(function () {
  const SUPABASE_URL = 'https://trtukmwbrmysjwkwihbv.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_j2XMYAZOQ9ECBEBq1jx93w_VC4fZ02x';
  const { createClient } = window.supabase;
  const db = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true } });

  const uid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  const nowISO = () => new Date().toISOString();

  function toCamel(row) {
    if (!row) return row;
    var out = {};
    for (var k in row) {
      var camel = k.replace(/_([a-z])/g, function(_, c) { return c.toUpperCase(); });
      out[camel] = row[k];
    }
    if (out.id) out.id = String(out.id);
    return out;
  }
  function toSnake(obj) {
    if (!obj) return obj;
    var out = {};
    for (var k in obj) {
      var snake = k.replace(/([A-Z])/g, '_$1').toLowerCase();
      out[snake] = obj[k];
    }
    return out;
  }
  function mapRows(rows) { return (rows || []).map(toCamel); }

  var store = {
    _loaded: false,
    sessionUserId: null,
    sessionUser: null,
    projectSettings: { projectName: 'THE PROJECT', worldName: 'Eravan', mapStatus: 'pending' },
    theBrain: { content: null, updatedBy: null, updatedAt: null },
    bestiaryCategories: ['Wild Fauna','Ancient Creatures','Magic-Affected','Humanoid Enemies','Legendary'],
    bestiaryEntries: [],
    bestiarySpecies: [],
    npcArchetypes: [
      { id: uid(), name: 'The Desperate Farmer', description: "A man with nothing left to lose and a field that won't yield." },
      { id: uid(), name: 'The Corrupt Guard', description: 'Wears the imperial sash. Will look the other way for a price.' },
      { id: uid(), name: 'The Exiled Noble', description: 'Carries a name the court no longer says aloud.' },
      { id: uid(), name: 'The Wandering Mage', description: 'Veilborn or unclaimed Ascended. Either way — dangerous.' },
      { id: uid(), name: 'The Bandit King', description: 'Holds a stretch of road by force and a grudge by inheritance.' },
    ],
    characters: [],
    factions: [],
    factionTensions: [],
    magicEntries: [],
    worldRegions: [
      { id: uid(), name: 'Northern Region', climate: '', dominantFaction: '', notableFeature: '', notes: '', isConfirmed: false },
      { id: uid(), name: 'Central Region', climate: '', dominantFaction: '', notableFeature: '', notes: '', isConfirmed: false },
      { id: uid(), name: 'Coastal Region', climate: '', dominantFaction: '', notableFeature: '', notes: '', isConfirmed: false },
      { id: uid(), name: 'Eastern Region', climate: '', dominantFaction: '', notableFeature: '', notes: '', isConfirmed: false },
      { id: uid(), name: 'Southern Region', climate: '', dominantFaction: '', notableFeature: '', notes: '', isConfirmed: false },
    ],
    worldNotes: '',
    worldBlocks: {
      summary: { content: '', isConfirmed: false }, details: { content: '', isConfirmed: false },
      cities: { content: '', isConfirmed: false }, mountains: { content: '', isConfirmed: false },
      rivers: { content: '', isConfirmed: false }, forests: { content: '', isConfirmed: false },
      magicalZones: { content: '', isConfirmed: false }, coastline: { content: '', isConfirmed: false },
      rules: { content: '', isConfirmed: false }, mapNotes: { content: '', isConfirmed: false },
    },
    loreEras: [
      { id: uid(), name: '', type: 'The Beginning', description: '', displayOrder: 0 },
      { id: uid(), name: '', type: 'Rise of Civilization', description: '', displayOrder: 1 },
      { id: uid(), name: '', type: 'A Great Conflict', description: '', displayOrder: 2 },
      { id: uid(), name: '', type: 'The Current Era', description: '', displayOrder: 3 },
    ],
    loreEvents: [],
    loreMyths: { content: '', isConfirmed: false },
    loreLost: { content: '', isConfirmed: false },
    economyEntries: [],
    economyBlocks: {
      currency: { rows: [], isConfirmed: false }, tradeGoods: { rows: [], isConfirmed: false },
      shops: { content: '', isConfirmed: false }, guilds: { content: '', isConfirmed: false },
      blackMarket: { content: '', isConfirmed: false }, events: { content: '', isConfirmed: false },
    },
    militaryStructure: [
      { id: uid(), rank: 'Foot Soldier', role: 'Basic infantry', numbers: 'Thousands', isConfirmed: true },
    ],
    militaryBlocks: {
      startingWar: { content: '', isConfirmed: true }, joiningWar: { content: '', isConfirmed: true },
      battleNotes: { content: '', isConfirmed: false }, consequences: { content: '', isConfirmed: true },
    },
    socialClasses: [
      { id: uid(), className: 'Peasant / Serf', description: 'Lowest rung, laborers and farmers', privileges: 'None', limitations: 'Taxed, conscripted, minimal rights', isConfirmed: true },
      { id: uid(), className: 'Freeman / Merchant', description: 'Independent workers, tradespeople', privileges: 'Business rights', limitations: 'No noble title', isConfirmed: true },
      { id: uid(), className: 'Knight / Soldier', description: 'Military class', privileges: 'Land grants, weapons', limitations: 'Bound to a lord', isConfirmed: true },
      { id: uid(), className: 'Noble', description: 'Landholders, governors', privileges: 'Political power, wealth', limitations: 'Expected loyalty to crown', isConfirmed: true },
      { id: uid(), className: 'Royalty / King', description: 'Ruling class', privileges: 'Supreme authority', limitations: 'Target of all political intrigue', isConfirmed: true },
      { id: uid(), className: 'Clergy / Mage', description: 'Religious or magical order', privileges: 'Special protections', limitations: "Bound by order's laws", isConfirmed: true },
    ],
    socialNote: 'Magic users can bypass this hierarchy entirely, creating deep resentment throughout the social system.',
    socialBlocks: {
      townRep: { title: 'Town and Local Reputation', content: 'Affects shop prices, quest access, guard behavior, and marriage eligibility.', isConfirmed: true },
      factionRep: { title: 'Faction Reputation', content: 'Affects alliances, military support, trade deals, assassination attempts, and bounties.', isConfirmed: true },
      worldRep: { title: 'World Reputation (Notoriety)', content: "Triggers when the player's actions make the whole world take notice.", isConfirmed: true },
      culture: { title: 'Cultural Norms by Region', content: '', isConfirmed: false },
      religion: { title: 'Religion and Faith', content: '', isConfirmed: false },
    },
    artifactTiers: [
      { id: uid(), name: 'Common', description: 'Mildly enchanted, easily found' },
      { id: uid(), name: 'Rare', description: 'Significant power, tied to a faction or historical event' },
      { id: uid(), name: 'Legendary', description: 'World-altering, often cursed or dangerous' },
      { id: uid(), name: 'Divine / Forbidden', description: 'Connected to the ancient world or forces beyond current understanding' },
    ],
    artifacts: [],
    devLog: [],
    decisions: [],
    rumours: [],
    calendarEntries: [],
    forumThreads: [],
    forumReplies: [],
    activity: [],
    profiles: [],
  };

  var subscribers = new Set();
  function notify() { subscribers.forEach(function(fn) { try { fn(); } catch(e) {} }); }
  function setStore(updater) {
    var prev = store;
    store = typeof updater === 'function' ? updater(store) : Object.assign({}, store, updater);
    notify();
    if (store.bestiaryCategories !== prev.bestiaryCategories) saveBestiaryCategories(store.bestiaryCategories);
    if (store.npcArchetypes !== prev.npcArchetypes) saveNpcArchetypes(store.npcArchetypes);
  }
  function patch(key, value) {
    store[key] = typeof value === 'function' ? value(store[key]) : value;
    notify();
  }
  function useStore() {
    var forceUpdate = React.useReducer(function(x) { return x + 1; }, 0)[1];
    React.useEffect(function() {
      subscribers.add(forceUpdate);
      return function() { subscribers.delete(forceUpdate); };
    }, []);
    return store;
  }

  function currentUser() { return store.sessionUser || null; }
  function currentDisplayName() { return store.sessionUser ? store.sessionUser.displayName : '—'; }
  function stampNew() {
    var now = nowISO(), who = currentDisplayName();
    return { id: uid(), createdBy: who, createdAt: now, updatedBy: who, updatedAt: now };
  }
  function stampUpdate() { return { updatedBy: currentDisplayName(), updatedAt: nowISO() }; }

  function logActivity(section, action, what) {
    var entry = { id: uid(), when: nowISO(), who: currentDisplayName(), section: section, action: action, what: what };
    store.activity = [entry].concat(store.activity).slice(0, 200);
    notify();
    db.from('activity').insert({ id: entry.id, who: entry.who, section: section, action: action, what: what, happened_at: nowISO() }).then(function() {}).catch(console.error);
  }

  var TABLE = {
    bestiaryEntries: 'bestiary_entries', bestiarySpecies: 'bestiary_species',
    characters: 'characters', factions: 'factions', factionTensions: 'faction_tensions',
    magicEntries: 'magic_entries', worldRegions: 'world_regions',
    loreEras: 'lore_eras', loreEvents: 'lore_events', artifacts: 'artifacts',
    devLog: 'dev_log', forumThreads: 'forum_threads', forumReplies: 'forum_replies',
    militaryStructure: 'military_structure', socialClasses: 'social_classes',
    artifactTiers: 'artifact_tiers', bestiaryCategories: 'bestiary_categories',
    npcArchetypes: 'npc_archetypes',
    decisions: 'decisions',
    rumours: 'rumours',
    calendarEntries: 'calendar_entries',
  };

  function addEntry(collection, data) {
    var entry = Object.assign({}, stampNew(), data);
    store[collection] = [entry].concat(store[collection]);
    notify();
    var table = TABLE[collection];
    if (table) db.from(table).insert(toSnake(entry)).then(function(r) { if (r.error) console.error('insert', r.error); });
    return entry;
  }
  function updateEntry(collection, id, patchData) {
    var idx = store[collection].findIndex(function(e) { return String(e.id) === String(id); });
    if (idx < 0) return null;
    var merged = Object.assign({}, store[collection][idx], patchData, stampUpdate());
    store[collection] = store[collection].slice(0, idx).concat([merged]).concat(store[collection].slice(idx + 1));
    notify();
    var table = TABLE[collection];
    if (table) {
      var row = toSnake(Object.assign({}, patchData, stampUpdate()));
      delete row.id;
      db.from(table).update(row).eq('id', id).then(function(r) { if (r.error) console.error('update', r.error); });
    }
    return merged;
  }
  function deleteEntry(collection, id) {
    store[collection] = store[collection].filter(function(e) { return String(e.id) !== String(id); });
    notify();
    var table = TABLE[collection];
    if (table) db.from(table).delete().eq('id', id).then(function(r) { if (r.error) console.error('delete', r.error); });
  }

  async function registerUser(opts) {
    if (!opts.email || !opts.password) return { error: 'Email and password are required.' };
    var r = await db.auth.signUp({ email: opts.email, password: opts.password, options: { data: { display_name: opts.displayName, role: opts.role } } });
    if (r.error) return { error: r.error.message };
    var profile = { id: r.data.user.id, displayName: opts.displayName, role: opts.role, email: opts.email };
    store.sessionUserId = r.data.user.id;
    store.sessionUser = profile;
    notify();
    await loadAllData();
    logActivity('Auth', 'registered', opts.displayName + ' joined the project');
    return { profile: profile };
  }
  async function loginUser(opts) {
    var r = await db.auth.signInWithPassword({ email: opts.email, password: opts.password });
    if (r.error) return { error: r.error.message };
    var meta = r.data.user.user_metadata || {};
    var profile = { id: r.data.user.id, email: r.data.user.email, displayName: meta.display_name || opts.email.split('@')[0], role: meta.role || 'designer' };
    store.sessionUserId = r.data.user.id;
    store.sessionUser = profile;
    notify();
    await loadAllData();
    logActivity('Auth', 'signed in', profile.displayName);
    return { profile: profile };
  }
  function logoutUser() {
    db.auth.signOut();
    store.sessionUserId = null; store.sessionUser = null; store._loaded = false;
    notify();
  }
  function updateProfile(id, data) {
    if (store.sessionUser && store.sessionUser.id === id) { store.sessionUser = Object.assign({}, store.sessionUser, data); notify(); }
    db.auth.updateUser({ data: { display_name: data.displayName, role: data.role } });
  }

  async function safeGet(table) {
    try { var r = await db.from(table).select('*'); return mapRows(r.data); } catch(e) { console.warn('fetch failed', table); return []; }
  }
  async function safeSingle(table) {
    try { var r = await db.from(table).select('*').maybeSingle(); return r.data ? toCamel(r.data) : null; } catch(e) { console.warn('single failed', table); return null; }
  }

  async function loadAllData() {
    try {
      var results = await Promise.all([
        safeSingle('project_settings'), safeSingle('the_brain'),
        safeGet('bestiary_categories'), safeGet('bestiary_entries'), safeGet('bestiary_species'),
        safeGet('npc_archetypes'), safeGet('characters'),
        safeGet('factions'), safeGet('faction_tensions'), safeGet('magic_entries'),
        safeGet('world_regions'), safeGet('world_blocks'),
        safeGet('lore_eras'), safeGet('lore_events'), safeGet('lore_blocks'),
        safeGet('economy_currency'), safeGet('economy_goods'), safeGet('economy_blocks'),
        safeGet('military_structure'), safeGet('military_blocks'),
        safeGet('social_classes'), safeGet('social_blocks'),
        safeGet('artifact_tiers'), safeGet('artifacts'),
        safeGet('dev_log'), safeGet('forum_threads'), safeGet('forum_replies'), safeGet('activity'),
      ]);
      var s = results[0], br = results[1], bCats = results[2], bEnt = results[3], bSp = results[4];
      var nArch = results[5], chars = results[6], facs = results[7], tens = results[8], magic = results[9];
      var reg = results[10], wBlk = results[11], eras = results[12], evts = results[13], lBlk = results[14];
      var eCurr = results[15], eGoods = results[16], eBlk = results[17], milStr = results[18], milBlk = results[19];
      var socCls = results[20], socBlk = results[21], artTiers = results[22], arts = results[23];
      var dlog = results[24], threads = results[25], replies = results[26], act = results[27];

      if (s) store.projectSettings = { projectName: s.projectName || 'THE PROJECT', worldName: s.worldName || 'Eravan', mapStatus: s.mapStatus || 'pending' };
      if (br && br.content) {
        var parsedContent = typeof br.content === 'string' ? JSON.parse(br.content) : br.content;
        store.theBrain = { content: parsedContent, updatedBy: br.updated_by || br.updatedBy, updatedAt: br.updated_at || br.updatedAt };
      }
      if (bCats.length) store.bestiaryCategories = bCats.sort(function(a,b){return (a.displayOrder||0)-(b.displayOrder||0);}).map(function(c){return c.name;});
      if (bEnt.length) store.bestiaryEntries = bEnt;
      if (bSp.length) store.bestiarySpecies = bSp;
      if (nArch.length) store.npcArchetypes = nArch;
      if (chars.length) store.characters = chars;
      if (facs.length) store.factions = facs;
      if (tens.length) store.factionTensions = tens;
      if (magic.length) store.magicEntries = magic;
      if (reg.length) store.worldRegions = reg.sort(function(a,b){return (a.displayOrder||0)-(b.displayOrder||0);});
      if (wBlk.length) { var bm = {}; wBlk.forEach(function(b){bm[b.id]={content:b.content||'',isConfirmed:b.isConfirmed||false};}); store.worldBlocks = Object.assign({}, store.worldBlocks, bm); }
      if (eras.length) store.loreEras = eras.sort(function(a,b){return (a.displayOrder||0)-(b.displayOrder||0);}).map(function(e){return Object.assign({},e,{type:e.eraType||e.type||''}); });
      if (evts.length) store.loreEvents = evts;
      if (lBlk.length) { lBlk.forEach(function(b){ if(b.id==='myths') store.loreMyths={content:b.content||'',isConfirmed:b.isConfirmed||false}; if(b.id==='lost') store.loreLost={content:b.content||'',isConfirmed:b.isConfirmed||false}; }); }
      var eBm = {}; eBlk.forEach(function(b){eBm[b.id]={content:b.content||'',isConfirmed:b.isConfirmed||false};});
      store.economyBlocks = { currency:{rows:eCurr,isConfirmed:false}, tradeGoods:{rows:eGoods,isConfirmed:false}, shops:eBm['shops']||{content:'',isConfirmed:false}, guilds:eBm['guilds']||{content:'',isConfirmed:false}, blackMarket:eBm['blackMarket']||{content:'',isConfirmed:false}, events:eBm['events']||{content:'',isConfirmed:false} };
      if (milStr.length) store.militaryStructure = milStr;
      var mBm = {}; milBlk.forEach(function(b){mBm[b.id]={content:b.content||'',isConfirmed:b.isConfirmed||false};}); store.militaryBlocks = Object.assign({}, store.militaryBlocks, mBm);
      if (socCls.length) store.socialClasses = socCls.sort(function(a,b){return (a.displayOrder||0)-(b.displayOrder||0);}).map(function(c){return Object.assign({},c,{className:c.className||c.class_name||''});});
      var sBm = {}; socBlk.forEach(function(b){sBm[b.id]={title:b.title||'',content:b.content||'',isConfirmed:b.isConfirmed||false};}); store.socialBlocks = Object.assign({}, store.socialBlocks, sBm);
      if (artTiers.length) store.artifactTiers = artTiers;
      if (arts.length) store.artifacts = arts;
      if (dlog.length) store.devLog = dlog.sort(function(a,b){return new Date(b.createdAt)-new Date(a.createdAt);});
      if (threads.length) store.forumThreads = threads.sort(function(a,b){return new Date(b.createdAt)-new Date(a.createdAt);});
      if (replies.length) store.forumReplies = replies.sort(function(a,b){return new Date(a.createdAt)-new Date(b.createdAt);});
      if (act.length) store.activity = act.sort(function(a,b){return new Date(b.happenedAt||b.when)-new Date(a.happenedAt||a.when);}).slice(0,200);
    } catch(err) {
      console.error('loadAllData error:', err);
    }
    store._loaded = true;
    notify();
  }

  function saveProjectSettings(data) {
    store.projectSettings = Object.assign({}, store.projectSettings, data); notify();
    db.from('project_settings').update(toSnake(Object.assign({}, data, { updatedBy: currentDisplayName(), updatedAt: nowISO() }))).eq('id', 1).then(function(r){if(r.error)console.error(r.error);});
  }
  function saveBrain(content) {
    var now = nowISO(), who = currentDisplayName();
    store.theBrain = { content: content, updatedBy: who, updatedAt: now }; notify();
    db.from('the_brain').update({ content: JSON.stringify(content), updated_by: who, updated_at: now }).eq('id', 1).then(function(r){if(r.error)console.error(r.error);});
  }
  function _saveBlock(table, id, data) {
    var row = { id: id, content: data.content, is_confirmed: data.isConfirmed, updated_by: currentDisplayName(), updated_at: nowISO() };
    db.from(table).upsert(row, { onConflict: 'id' }).then(function(r){if(r.error)console.error('block save',r.error);});
  }
  function saveBestiaryCategories(names) {
    // Upsert each category by name
    var rows = names.map(function(name, i) { return { id: name.toLowerCase().replace(/[^a-z0-9]/g,'_'), name: name, display_order: i }; });
    db.from('bestiary_categories').upsert(rows, { onConflict: 'id' }).then(function(r){if(r.error)console.error('cats',r.error);});
  }
  function saveNpcArchetypes(archetypes) {
    archetypes.forEach(function(a) {
      if (a.id && a.id.length < 40) {
        db.from('npc_archetypes').upsert({ id: a.id, name: a.name, description: a.description }, { onConflict: 'id' }).then(function(r){if(r.error)console.error('archetype',r.error);});
      }
    });
  }
  function saveWorldBlock(id, data)    { store.worldBlocks[id] = Object.assign({}, store.worldBlocks[id], data); notify(); _saveBlock('world_blocks', id, data); }
  function saveMilitaryBlock(id, data) { store.militaryBlocks[id] = Object.assign({}, store.militaryBlocks[id], data); notify(); _saveBlock('military_blocks', id, data); }
  function saveSocialBlock(id, data)   { store.socialBlocks[id] = Object.assign({}, store.socialBlocks[id], data); notify(); _saveBlock('social_blocks', id, data); }
  function saveLoreBlock(id, data) {
    if (id==='myths') store.loreMyths = Object.assign({}, store.loreMyths, data);
    if (id==='lost')  store.loreLost  = Object.assign({}, store.loreLost, data);
    notify();
    var row = { id: id, content: data.content, is_confirmed: data.isConfirmed, updated_by: currentDisplayName(), updated_at: nowISO() };
    db.from('lore_blocks').upsert(row, { onConflict: 'id' }).then(function(r){if(r.error)console.error('lore block',r.error);});
  }
  function saveEconomyBlock(id, data) {
    store.economyBlocks[id] = Object.assign({}, store.economyBlocks[id], data); notify();
    if (typeof data.content === 'string') _saveBlock('economy_blocks', id, data);
  }

  function subscribeRealtime() {
    db.channel('ystc-realtime').on('postgres_changes', { event: '*', schema: 'public' }, function(payload) {
      var reloads = {
        bestiary_entries: function() { safeGet('bestiary_entries').then(function(r){if(r.length)patch('bestiaryEntries',r);}); },
        bestiary_species: function() { safeGet('bestiary_species').then(function(r){if(r.length)patch('bestiarySpecies',r);}); },
        characters:       function() { safeGet('characters').then(function(r){patch('characters',r);}); },
        factions:         function() { safeGet('factions').then(function(r){patch('factions',r);}); },
        artifacts:        function() { safeGet('artifacts').then(function(r){patch('artifacts',r);}); },
        dev_log:          function() { safeGet('dev_log').then(function(r){patch('devLog',r.sort(function(a,b){return new Date(b.createdAt)-new Date(a.createdAt);}));}); },
        forum_threads:    function() { safeGet('forum_threads').then(function(r){patch('forumThreads',r.sort(function(a,b){return new Date(b.createdAt)-new Date(a.createdAt);}));}); },
        forum_replies:    function() { safeGet('forum_replies').then(function(r){patch('forumReplies',r.sort(function(a,b){return new Date(a.createdAt)-new Date(b.createdAt);}));}); },
        activity:         function() { safeGet('activity').then(function(r){patch('activity',r.sort(function(a,b){return new Date(b.happenedAt||b.when)-new Date(a.happenedAt||a.when);}).slice(0,200));}); },
      };
      var fn = reloads[payload.table]; if (fn) fn();
    }).subscribe();
  }

  async function initSession() {
    try {
      var r = await db.auth.getSession();
      if (r.data && r.data.session && r.data.session.user) {
        var u = r.data.session.user;
        var meta = u.user_metadata || {};
        store.sessionUserId = u.id;
        store.sessionUser = { id: u.id, email: u.email, displayName: meta.display_name || u.email.split('@')[0], role: meta.role || 'designer' };
        notify();
        await loadAllData();
        subscribeRealtime();
      }
    } catch(e) { console.error('initSession error', e); }
  }

  function formatStamp(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'2-digit'}).toUpperCase() + ' · ' + d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'});
  }
  function relativeStamp(iso) {
    if (!iso) return '';
    var diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff/60) + 'm ago';
    if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
    if (diff < 86400*7) return Math.floor(diff/86400) + 'd ago';
    return formatStamp(iso);
  }


  async function uploadImage(file) {
    var allowed = ["jpg","jpeg","png","webp","gif","avif"];
    var ext = (file.name || "").split(".").pop().toLowerCase();
    if (!allowed.includes(ext)) throw new Error("Supported: JPG, PNG, WebP, GIF");
    var path = "img_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2,8) + "." + ext;
    var r = await db.storage.from("images").upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
    if (r.error) throw new Error(r.error.message);
    var pub = db.storage.from("images").getPublicUrl(path);
    return pub.data.publicUrl;
  }
  async function deleteImage(url) {
    if (!url) return;
    var parts = url.split("/images/");
    if (parts[1]) await db.storage.from("images").remove([parts[1]]).catch(console.error);
  }

  window.YSTC = {
    uid: uid, nowISO: nowISO, db: db,
    store: function() { return store; },
    useStore: useStore, setStore: setStore, patch: patch,
    addEntry: addEntry, updateEntry: updateEntry, deleteEntry: deleteEntry,
    logActivity: logActivity, currentUser: currentUser, currentDisplayName: currentDisplayName,
    stampNew: stampNew, stampUpdate: stampUpdate,
    registerUser: registerUser, loginUser: loginUser, logoutUser: logoutUser, updateProfile: updateProfile,
    saveProjectSettings: saveProjectSettings, saveBrain: saveBrain,
    saveBestiaryCategories: saveBestiaryCategories, saveNpcArchetypes: saveNpcArchetypes,
    saveWorldBlock: saveWorldBlock, saveMilitaryBlock: saveMilitaryBlock,
    saveSocialBlock: saveSocialBlock, saveLoreBlock: saveLoreBlock, saveEconomyBlock: saveEconomyBlock,
    loadAllData: loadAllData,
    uploadImage: uploadImage, deleteImage: deleteImage,
    formatStamp: formatStamp, relativeStamp: relativeStamp,
    resetAll: function() { if (!confirm('Reload all data from server?')) return; loadAllData(); },
  };

  if (window.React) {
    window.useState    = React.useState;
    window.useEffect   = React.useEffect;
    window.useMemo     = React.useMemo;
    window.useRef      = React.useRef;
    window.useCallback = React.useCallback;
    window.useReducer  = React.useReducer;
  }

  initSession();
})();
