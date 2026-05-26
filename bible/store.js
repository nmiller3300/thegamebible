/* bible/store.js — Supabase-backed store
 * Replaces the localStorage prototype store.
 * Keeps the exact same window.YSTC API so no section files change.
 */
(function () {

  const SUPABASE_URL = 'https://trtukmwbrmysjwkwihbv.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_j2XMYAZOQ9ECBEBq1jx93w_VC4fZ02x';

  const { createClient } = window.supabase;
  const db = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true },
  });

  const uid = () => 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  const nowISO = () => new Date().toISOString();

  function toCamel(row) {
    if (!row) return row;
    const out = {};
    for (const k in row) {
      const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      out[camel] = row[k];
    }
    if (out.id) out.id = String(out.id);
    return out;
  }
  function toSnake(obj) {
    if (!obj) return obj;
    const out = {};
    for (const k in obj) {
      const snake = k.replace(/([A-Z])/g, '_$1').toLowerCase();
      out[snake] = obj[k];
    }
    return out;
  }
  const mapRows = (rows) => (rows || []).map(toCamel);

  // ── Local reactive store ──────────────────────────────────────────────
  let store = {
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
      { id: uid(), name: 'The Corrupt Guard',    description: 'Wears the imperial sash. Will look the other way for a price.' },
      { id: uid(), name: 'The Exiled Noble',     description: 'Carries a name the court no longer says aloud.' },
      { id: uid(), name: 'The Wandering Mage',   description: 'Veilborn or unclaimed Ascended. Either way — dangerous.' },
      { id: uid(), name: 'The Bandit King',      description: 'Holds a stretch of road by force and a grudge by inheritance.' },
    ],
    characters: [],
    factions: [],
    factionTensions: [],
    magicEntries: [],
    worldRegions: [
      { id: uid(), name: 'Northern Region', climate: '', dominantFaction: '', notableFeature: '', notes: '', isConfirmed: false },
      { id: uid(), name: 'Central Region',  climate: '', dominantFaction: '', notableFeature: '', notes: '', isConfirmed: false },
      { id: uid(), name: 'Coastal Region',  climate: '', dominantFaction: '', notableFeature: '', notes: '', isConfirmed: false },
      { id: uid(), name: 'Eastern Region',  climate: '', dominantFaction: '', notableFeature: '', notes: '', isConfirmed: false },
      { id: uid(), name: 'Southern Region', climate: '', dominantFaction: '', notableFeature: '', notes: '', isConfirmed: false },
    ],
    worldNotes: '',
    worldBlocks: {
      summary:{ content:'',isConfirmed:false }, details:{ content:'',isConfirmed:false },
      cities:{ content:'',isConfirmed:false }, mountains:{ content:'',isConfirmed:false },
      rivers:{ content:'',isConfirmed:false }, forests:{ content:'',isConfirmed:false },
      magicalZones:{ content:'',isConfirmed:false }, coastline:{ content:'',isConfirmed:false },
      rules:{ content:'',isConfirmed:false }, mapNotes:{ content:'',isConfirmed:false },
    },
    loreEras: [
      { id: uid(), name:'', type:'The Beginning',        description:'', displayOrder:0 },
      { id: uid(), name:'', type:'Rise of Civilization', description:'', displayOrder:1 },
      { id: uid(), name:'', type:'A Great Conflict',     description:'', displayOrder:2 },
      { id: uid(), name:'', type:'The Current Era',      description:'', displayOrder:3 },
    ],
    loreEvents: [],
    loreMyths: { content:'', isConfirmed:false },
    loreLost:  { content:'', isConfirmed:false },
    economyBlocks: {
      currency:   { rows:[], isConfirmed:false },
      tradeGoods: { rows:[], isConfirmed:false },
      shops:       { content:'', isConfirmed:false },
      guilds:      { content:'', isConfirmed:false },
      blackMarket: { content:'', isConfirmed:false },
      events:      { content:'', isConfirmed:false },
    },
    militaryStructure: [
      { id: uid(), rank:'Foot Soldier', role:'Basic infantry', numbers:'Thousands', isConfirmed:true },
    ],
    militaryBlocks: {
      startingWar: { content:'', isConfirmed:true }, joiningWar: { content:'', isConfirmed:true },
      battleNotes: { content:'', isConfirmed:false }, consequences: { content:'', isConfirmed:true },
    },
    socialClasses: [
      { id:uid(), className:'Peasant / Serf',     description:'Lowest rung, laborers and farmers',  privileges:'None',                   limitations:'Taxed, conscripted, minimal rights',   isConfirmed:true },
      { id:uid(), className:'Freeman / Merchant', description:'Independent workers, tradespeople',  privileges:'Business rights',        limitations:'No noble title',                       isConfirmed:true },
      { id:uid(), className:'Knight / Soldier',   description:'Military class',                     privileges:'Land grants, weapons',   limitations:'Bound to a lord',                      isConfirmed:true },
      { id:uid(), className:'Noble',              description:'Landholders, governors',             privileges:'Political power, wealth',limitations:'Expected loyalty to crown',            isConfirmed:true },
      { id:uid(), className:'Royalty / King',     description:'Ruling class',                       privileges:'Supreme authority',      limitations:'Target of all political intrigue',     isConfirmed:true },
      { id:uid(), className:'Clergy / Mage',      description:'Religious or magical order',         privileges:'Special protections',    limitations:"Bound by order's laws",                isConfirmed:true },
    ],
    socialNote: 'Magic users can bypass this hierarchy entirely, creating deep resentment throughout the social system.',
    socialBlocks: {
      townRep:    { title:'Town and Local Reputation',    content:'Affects shop prices, quest access, guard behavior, and marriage eligibility.', isConfirmed:true },
      factionRep: { title:'Faction Reputation',           content:'Affects alliances, military support, trade deals, assassination attempts, and bounties.', isConfirmed:true },
      worldRep:   { title:'World Reputation (Notoriety)', content:"Triggers when the player's actions make the whole world take notice.", isConfirmed:true },
      culture:    { title:'Cultural Norms by Region',     content:'', isConfirmed:false },
      religion:   { title:'Religion and Faith',           content:'', isConfirmed:false },
    },
    artifactTiers: [
      { id:uid(), name:'Common',            description:'Mildly enchanted, easily found' },
      { id:uid(), name:'Rare',              description:'Significant power, tied to a faction or historical event' },
      { id:uid(), name:'Legendary',         description:'World-altering, often cursed or dangerous' },
      { id:uid(), name:'Divine / Forbidden',description:'Connected to the ancient world or forces beyond current understanding' },
    ],
    artifacts: [],
    devLog: [],
    forumThreads: [],
    forumReplies: [],
    activity: [],
    profiles: [],
  };

  const subscribers = new Set();
  function notify() { subscribers.forEach((fn) => { try { fn(); } catch(e){} }); }
  function setStore(updater) {
    store = typeof updater === 'function' ? updater(store) : { ...store, ...updater };
    notify();
  }
  function patch(key, value) {
    store[key] = typeof value === 'function' ? value(store[key]) : value;
    notify();
  }
  function useStore() {
    const [, force] = React.useReducer((x) => x + 1, 0);
    React.useEffect(() => { subscribers.add(force); return () => subscribers.delete(force); }, []);
    return store;
  }

  function currentUser() { return store.sessionUser || null; }
  function currentDisplayName() { return store.sessionUser ? store.sessionUser.displayName : '—'; }
  function stampNew() {
    const now = nowISO(), who = currentDisplayName();
    return { id: uid(), createdBy: who, createdAt: now, updatedBy: who, updatedAt: now };
  }
  function stampUpdate() { return { updatedBy: currentDisplayName(), updatedAt: nowISO() }; }

  function logActivity(section, action, what) {
    const entry = { id: uid(), when: nowISO(), who: currentDisplayName(), section, action, what };
    store.activity = [entry, ...store.activity].slice(0, 200);
    notify();
    db.from('activity').insert({ who: entry.who, section, action, what }).then(() => {}).catch(console.error);
  }

  const TABLE = {
    bestiaryEntries:'bestiary_entries', bestiarySpecies:'bestiary_species',
    characters:'characters', factions:'factions', factionTensions:'faction_tensions',
    magicEntries:'magic_entries', worldRegions:'world_regions',
    loreEras:'lore_eras', loreEvents:'lore_events', artifacts:'artifacts',
    devLog:'dev_log', forumThreads:'forum_threads', forumReplies:'forum_replies',
    militaryStructure:'military_structure', socialClasses:'social_classes',
    artifactTiers:'artifact_tiers', bestiaryCategories:'bestiary_categories',
    npcArchetypes:'npc_archetypes',
  };

  function addEntry(collection, data) {
    const entry = { ...stampNew(), ...data };
    store[collection] = [entry, ...store[collection]];
    notify();
    const table = TABLE[collection];
    if (table) {
      db.from(table).insert(toSnake(entry)).then(({ error }) => { if (error) console.error('insert', error); });
    }
    return entry;
  }
  function updateEntry(collection, id, patchData) {
    const idx = store[collection].findIndex((e) => String(e.id) === String(id));
    if (idx < 0) return null;
    const merged = { ...store[collection][idx], ...patchData, ...stampUpdate() };
    store[collection] = [...store[collection].slice(0,idx), merged, ...store[collection].slice(idx+1)];
    notify();
    const table = TABLE[collection];
    if (table) {
      const row = toSnake({ ...patchData, ...stampUpdate() });
      delete row.id;
      db.from(table).update(row).eq('id', id).then(({ error }) => { if (error) console.error('update', error); });
    }
    return merged;
  }
  function deleteEntry(collection, id) {
    store[collection] = store[collection].filter((e) => String(e.id) !== String(id));
    notify();
    const table = TABLE[collection];
    if (table) db.from(table).delete().eq('id', id).then(({ error }) => { if (error) console.error('delete', error); });
  }

  async function registerUser({ email, password, displayName, role }) {
    if (!email || !password) return { error: 'Email and password are required.' };
    const { data, error } = await db.auth.signUp({ email, password, options: { data: { display_name: displayName, role } } });
    if (error) return { error: error.message };
    const profile = { id: data.user.id, displayName, role, email };
    store.sessionUserId = data.user.id;
    store.sessionUser = profile;
    notify();
    await loadAllData();
    logActivity('Auth', 'registered', displayName + ' joined the project');
    return { profile };
  }
  async function loginUser({ email, password }) {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    const meta = data.user.user_metadata || {};
    const profile = { id: data.user.id, email: data.user.email, displayName: meta.display_name || email.split('@')[0], role: meta.role || 'designer' };
    store.sessionUserId = data.user.id;
    store.sessionUser = profile;
    notify();
    await loadAllData();
    logActivity('Auth', 'signed in', profile.displayName);
    return { profile };
  }
  function logoutUser() {
    db.auth.signOut();
    store.sessionUserId = null; store.sessionUser = null; store._loaded = false;
    notify();
  }
  function updateProfile(id, data) {
    if (store.sessionUser && store.sessionUser.id === id) { store.sessionUser = { ...store.sessionUser, ...data }; notify(); }
    db.auth.updateUser({ data: { display_name: data.displayName, role: data.role } });
    if (data.displayName) db.from('profiles').update({ display_name: data.displayName }).eq('id', id);
  }

  async function fetchTable(table) {
    const { data, error } = await db.from(table).select('*');
    if (error) { console.error('fetchTable', table, error); return []; }
    return mapRows(data);
  }

  async function loadAllData() {
    const [
      settingsRes, brainRes,
      bCats, bEntries, bSpecies,
      npcArch, chars,
      facs, tens, magic,
      regions, wBlocks,
      eras, events, lBlocks,
      eCurr, eGoods, eBlocks,
      milStr, milBlk,
      socCls, socBlk,
      artTiers, arts,
      dlog, threads, replies, act,
    ] = await Promise.all([
      db.from('project_settings').select('*').single(),
      db.from('the_brain').select('*').single(),
      fetchTable('bestiary_categories'), fetchTable('bestiary_entries'), fetchTable('bestiary_species'),
      fetchTable('npc_archetypes'), fetchTable('characters'),
      fetchTable('factions'), fetchTable('faction_tensions'), fetchTable('magic_entries'),
      fetchTable('world_regions'), fetchTable('world_blocks'),
      fetchTable('lore_eras'), fetchTable('lore_events'), fetchTable('lore_blocks'),
      fetchTable('economy_currency'), fetchTable('economy_goods'), fetchTable('economy_blocks'),
      fetchTable('military_structure'), fetchTable('military_blocks'),
      fetchTable('social_classes'), fetchTable('social_blocks'),
      fetchTable('artifact_tiers'), fetchTable('artifacts'),
      fetchTable('dev_log'), fetchTable('forum_threads'), fetchTable('forum_replies'), fetchTable('activity'),
    ]);

    if (settingsRes.data) {
      const s = toCamel(settingsRes.data);
      store.projectSettings = { projectName: s.projectName||'THE PROJECT', worldName: s.worldName||'Eravan', mapStatus: s.mapStatus||'pending' };
    }
    if (brainRes.data && brainRes.data.content) store.theBrain = toCamel(brainRes.data);
    if (bCats.length)    store.bestiaryCategories = bCats.sort((a,b)=>(a.displayOrder||0)-(b.displayOrder||0)).map(c=>c.name);
    if (bEntries.length) store.bestiaryEntries = bEntries;
    if (bSpecies.length) store.bestiarySpecies = bSpecies;
    if (npcArch.length)  store.npcArchetypes = npcArch;
    if (chars.length)    store.characters = chars;
    if (facs.length)     store.factions = facs;
    if (tens.length)     store.factionTensions = tens;
    if (magic.length)    store.magicEntries = magic;
    if (regions.length)  store.worldRegions = regions.sort((a,b)=>(a.displayOrder||0)-(b.displayOrder||0));
    if (wBlocks.length) {
      const bm = {};
      wBlocks.forEach(b => { bm[b.id] = { content: b.content||'', isConfirmed: b.isConfirmed||false }; });
      store.worldBlocks = { ...store.worldBlocks, ...bm };
    }
    if (eras.length) store.loreEras = eras.sort((a,b)=>(a.displayOrder||0)-(b.displayOrder||0)).map(e=>({...e, type: e.eraType||e.type||''}));
    if (events.length) store.loreEvents = events;
    if (lBlocks.length) {
      lBlocks.forEach(b => {
        if (b.id==='myths') store.loreMyths = { content: b.content||'', isConfirmed: b.isConfirmed||false };
        if (b.id==='lost')  store.loreLost  = { content: b.content||'', isConfirmed: b.isConfirmed||false };
      });
    }
    const eBlockMap = {};
    eBlocks.forEach(b => { eBlockMap[b.id] = { content: b.content||'', isConfirmed: b.isConfirmed||false }; });
    store.economyBlocks = {
      currency:   { rows: eCurr.sort((a,b)=>(a.displayOrder||0)-(b.displayOrder||0)), isConfirmed: false },
      tradeGoods: { rows: eGoods.sort((a,b)=>(a.displayOrder||0)-(b.displayOrder||0)), isConfirmed: false },
      shops:       eBlockMap['shops']       || { content:'', isConfirmed:false },
      guilds:      eBlockMap['guilds']      || { content:'', isConfirmed:false },
      blackMarket: eBlockMap['blackMarket'] || { content:'', isConfirmed:false },
      events:      eBlockMap['events']      || { content:'', isConfirmed:false },
    };
    if (milStr.length) store.militaryStructure = milStr.sort((a,b)=>(a.displayOrder||0)-(b.displayOrder||0));
    const milBM = {};
    milBlk.forEach(b => { milBM[b.id] = { content: b.content||'', isConfirmed: b.isConfirmed||false }; });
    store.militaryBlocks = { ...store.militaryBlocks, ...milBM };
    if (socCls.length) store.socialClasses = socCls.sort((a,b)=>(a.displayOrder||0)-(b.displayOrder||0)).map(c=>({...c, className: c.className||c.class_name||''}));
    const socBM = {};
    socBlk.forEach(b => { socBM[b.id] = { title: b.title||'', content: b.content||'', isConfirmed: b.isConfirmed||false }; });
    store.socialBlocks = { ...store.socialBlocks, ...socBM };
    if (artTiers.length) store.artifactTiers = artTiers.sort((a,b)=>(a.displayOrder||0)-(b.displayOrder||0));
    if (arts.length)     store.artifacts = arts;
    if (dlog.length)     store.devLog = dlog.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    if (threads.length)  store.forumThreads = threads.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    if (replies.length)  store.forumReplies = replies.sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
    if (act.length)      store.activity = act.sort((a,b)=>new Date(b.happenedAt||b.when)-new Date(a.happenedAt||a.when)).slice(0,200);

    store._loaded = true;
    notify();
  }

  function saveProjectSettings(data) {
    store.projectSettings = { ...store.projectSettings, ...data };
    notify();
    db.from('project_settings').update(toSnake({ ...data, updatedBy: currentDisplayName(), updatedAt: nowISO() })).eq('id', 1)
      .then(({ error }) => { if (error) console.error(error); });
  }
  function saveBrain(content) {
    const now = nowISO(), who = currentDisplayName();
    store.theBrain = { content, updatedBy: who, updatedAt: now };
    notify();
    db.from('the_brain').update({ content, updated_by: who, updated_at: now }).eq('id', 1)
      .then(({ error }) => { if (error) console.error(error); });
  }
  function _saveBlock(table, id, data) {
    db.from(table).update({ content: data.content, is_confirmed: data.isConfirmed, updated_by: currentDisplayName(), updated_at: nowISO() }).eq('id', id)
      .then(({ error }) => { if (error) console.error(error); });
  }
  function saveWorldBlock(id, data)    { store.worldBlocks[id] = { ...store.worldBlocks[id], ...data }; notify(); _saveBlock('world_blocks', id, data); }
  function saveMilitaryBlock(id, data) { store.militaryBlocks[id] = { ...store.militaryBlocks[id], ...data }; notify(); _saveBlock('military_blocks', id, data); }
  function saveSocialBlock(id, data)   { store.socialBlocks[id] = { ...store.socialBlocks[id], ...data }; notify(); _saveBlock('social_blocks', id, data); }
  function saveLoreBlock(id, data) {
    if (id==='myths') store.loreMyths = { ...store.loreMyths, ...data };
    if (id==='lost')  store.loreLost  = { ...store.loreLost,  ...data };
    notify();
    _saveBlock('lore_blocks', id, data);
  }
  function saveEconomyBlock(id, data) {
    store.economyBlocks[id] = { ...store.economyBlocks[id], ...data };
    notify();
    if (typeof data.content === 'string') _saveBlock('economy_blocks', id, data);
  }

  function subscribeRealtime() {
    const RELOAD = {
      bestiary_entries:  () => fetchTable('bestiary_entries').then(r => { if(r.length) patch('bestiaryEntries', r); }),
      bestiary_species:  () => fetchTable('bestiary_species').then(r => { if(r.length) patch('bestiarySpecies', r); }),
      characters:        () => fetchTable('characters').then(r => patch('characters', r)),
      factions:          () => fetchTable('factions').then(r => patch('factions', r)),
      faction_tensions:  () => fetchTable('faction_tensions').then(r => patch('factionTensions', r)),
      magic_entries:     () => fetchTable('magic_entries').then(r => patch('magicEntries', r)),
      artifacts:         () => fetchTable('artifacts').then(r => patch('artifacts', r)),
      dev_log:           () => fetchTable('dev_log').then(r => patch('devLog', r.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)))),
      forum_threads:     () => fetchTable('forum_threads').then(r => patch('forumThreads', r.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)))),
      forum_replies:     () => fetchTable('forum_replies').then(r => patch('forumReplies', r.sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)))),
      activity:          () => fetchTable('activity').then(r => patch('activity', r.sort((a,b)=>new Date(b.happenedAt||b.when)-new Date(a.happenedAt||a.when)).slice(0,200))),
      project_settings:  () => db.from('project_settings').select('*').single().then(({data}) => { if(data){const s=toCamel(data); patch('projectSettings',{projectName:s.projectName||'THE PROJECT',worldName:s.worldName||'Eravan',mapStatus:s.mapStatus||'pending'});}}),
      the_brain:         () => db.from('the_brain').select('*').single().then(({data}) => { if(data && data.content) patch('theBrain', toCamel(data)); }),
    };
    db.channel('ystc-realtime')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        const reload = RELOAD[payload.table];
        if (reload) reload();
      })
      .subscribe();
  }

  async function initSession() {
    const { data: { session } } = await db.auth.getSession();
    if (session && session.user) {
      const u = session.user;
      const meta = u.user_metadata || {};
      store.sessionUserId = u.id;
      store.sessionUser = { id: u.id, email: u.email, displayName: meta.display_name || u.email.split('@')[0], role: meta.role || 'designer' };
      notify();
      await loadAllData();
      subscribeRealtime();
    }
  }

  function formatStamp(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'2-digit'}).toUpperCase() + ' · ' + d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'});
  }
  function relativeStamp(iso) {
    if (!iso) return '';
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60)        return 'just now';
    if (diff < 3600)      return Math.floor(diff/60)    + 'm ago';
    if (diff < 86400)     return Math.floor(diff/3600)  + 'h ago';
    if (diff < 86400*7)   return Math.floor(diff/86400) + 'd ago';
    return formatStamp(iso);
  }

  window.YSTC = {
    uid, nowISO, db,
    store: () => store,
    useStore, setStore, patch,
    addEntry, updateEntry, deleteEntry,
    logActivity, currentUser, currentDisplayName, stampNew, stampUpdate,
    registerUser, loginUser, logoutUser, updateProfile,
    saveProjectSettings, saveBrain,
    saveWorldBlock, saveMilitaryBlock, saveSocialBlock, saveLoreBlock, saveEconomyBlock,
    loadAllData,
    formatStamp, relativeStamp,
    resetAll: () => { if (!confirm('Reload all data fresh from the server?')) return; loadAllData(); },
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
