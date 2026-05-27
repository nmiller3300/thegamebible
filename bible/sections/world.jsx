/* Game Bible — sections/world.jsx */
const Yw = window.YSTC;

function WorldSection() {
  const store = Yw.useStore();

  function patchBlock(key, partial) {
    const updated = { ...store.worldBlocks[key], ...partial };
    Yw.saveWorldBlock(key, updated);
    Yw.logActivity('World', 'edited', key);
  }

  function updateRegions(next) {
    Yw.setStore({ worldRegions: next });
    next.forEach((r) => Yw.updateEntry('worldRegions', r.id, r));
  }

  function handleMapUpload(url) {
    Yw.saveWorldBlock('mapImage', { content: url, isConfirmed: true });
    Yw.logActivity('World', 'uploaded', 'map image');
  }

  const mapImageUrl = store.worldBlocks.mapImage ? store.worldBlocks.mapImage.content : '';
  const regionsAllConfirmed = store.worldRegions.length > 0 && store.worldRegions.every((r) => r.isConfirmed);

  return (
    <Section>
      <DocHead
        kicker="System · Geography and place"
        title="World &"
        titleEm="Geography"
        deck={`The continent is named ${store.projectSettings.worldName}. Cities, mountains, rivers, and magical zones are added as they are decided.`}
        code="WORLD-001"
        codeMeta={{ regions: store.worldRegions.length, map: store.projectSettings.mapStatus }}
      />

      <SectionMark>The Map</SectionMark>
      <div className="paper-card spacious">
        <div className="spread" style={{ marginBottom: 18 }}>
          <h3 style={{ margin: 0 }}>
            {store.projectSettings.mapStatus === 'uploaded' ? `${store.projectSettings.worldName} — Primary Map` : 'Map pending'}
          </h3>
          <StatusPill status={store.projectSettings.mapStatus === 'uploaded' ? 'confirmed' : 'pending'} />
        </div>
        {mapImageUrl ? (
          <div style={{ position:'relative', borderRadius:2, background:'var(--paper-2)', lineHeight:0 }}>
            <img
              src={mapImageUrl}
              alt="World map"
              style={{ width:'100%', height:'auto', display:'block' }}
            />
            <button type="button" onClick={() => handleMapUpload('')} style={{ position:'absolute', top:10, right:10, background:'var(--imperial)', color:'var(--paper)', border:'none', borderRadius:2, padding:'4px 10px', cursor:'pointer', fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase' }}>Remove</button>
            <button type="button" onClick={() => document.getElementById('map-upload-input').click()} style={{ position:'absolute', top:10, left:10, background:'oklch(0.16 0.014 60 / 0.75)', color:'var(--paper)', border:'none', borderRadius:2, padding:'4px 10px', cursor:'pointer', fontFamily:'var(--mono)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase' }}>Replace</button>
            <input id="map-upload-input" type="file" accept="image/*" style={{ display:'none' }} onChange={async (e) => { const f = e.target.files[0]; if(f){ const url = await window.YSTC.uploadImage(f); handleMapUpload(url); } }} />
          </div>
        ) : (
          <ImageSlot
            value=""
            onChange={handleMapUpload}
            height={400}
            label="Upload White's map when it is ready"
          />
        )}
        <div style={{ marginTop: 18 }}>
          <Field label="Map notes">
            <TextArea
              value={store.worldNotes}
              onChange={(v) => Yw.setStore({ worldNotes: v })}
              rows={3}
              placeholder="Region names, geographic ideas, anything that needs a home before the map is complete."
            />
          </Field>
        </div>
      </div>

      <SectionMark>Regions</SectionMark>
      <TableBlock
        title="Regions of Eravan"
        columns={[
          { key: 'name', label: 'Region', placeholder: 'Name' },
          { key: 'climate', label: 'Climate', placeholder: 'Cold, alpine' },
          { key: 'dominantFaction', label: 'Faction', placeholder: 'TBD' },
          { key: 'notableFeature', label: 'Notable feature', placeholder: 'TBD' },
        ]}
        rows={store.worldRegions}
        onChange={updateRegions}
        isConfirmed={regionsAllConfirmed}
        onStatusChange={(b) => {
          const next = store.worldRegions.map((r) => ({ ...r, isConfirmed: b }));
          Yw.setStore({ worldRegions: next });
        }}
      />

      <SectionMark>World Summary</SectionMark>
      <div className="stack">
        <ProseBlock title="What this world is" body={store.worldBlocks.summary.content} isConfirmed={store.worldBlocks.summary.isConfirmed} onChange={(p) => patchBlock('summary', p)} emptyHint="An open medieval fantasy sandbox. The player can be anyone. Tone shifts based on status." />
        <ProseBlock title="Confirmed details" body={store.worldBlocks.details.content} isConfirmed={store.worldBlocks.details.isConfirmed} onChange={(p) => patchBlock('details', p)} emptyHint="Spellcasting exists. Mythical creatures exist. Reputation is tracked globally and locally." />
      </div>

      <SectionMark>Geography</SectionMark>
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))' }}>
        {[
          ['cities',       'Cities and towns',      'Major settlements, their character, who controls them.'],
          ['mountains',    'Mountains',              'Location, scale, who lives in them.'],
          ['rivers',       'Rivers',                 'Where they flow, what they feed, what they cost to cross.'],
          ['forests',      'Forests',                'Old growth, hunting grounds, who claims them.'],
          ['magicalZones', 'Magical zones',          'Veilborn enclaves, drained leylines, places to avoid.'],
          ['coastline',    'Coastline',              'Ports, free cities, what the sea trades.'],
        ].map(([key, title, hint]) => (
          <ProseBlock key={key} title={title} body={store.worldBlocks[key].content} isConfirmed={store.worldBlocks[key].isConfirmed} onChange={(p) => patchBlock(key, p)} emptyHint={hint} />
        ))}
      </div>

      <SectionMark>World Rules</SectionMark>
      <ProseBlock title="Fundamental truths" body={store.worldBlocks.rules.content} isConfirmed={store.worldBlocks.rules.isConfirmed} onChange={(p) => patchBlock('rules', p)} emptyHint="Magic exists. Mythical creatures roam. Reputation is tracked. The player can rise or fall in any direction. Wars can be started, joined, or ended." />
    </Section>
  );
}

window.WorldSection = WorldSection;
