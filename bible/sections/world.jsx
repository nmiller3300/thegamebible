/* Game Bible — sections/world.jsx */
const Yw = window.YSTC;

function WorldSection() {
  const store = Yw.useStore();

  function patchBlock(key, partial) {
    const next = { ...store.worldBlocks, [key]: { ...store.worldBlocks[key], ...partial } };
    Yw.setStore({ worldBlocks: next });
    Yw.logActivity('World', 'edited', key);
  }
  function updateRegions(next) {
    Yw.setStore({ worldRegions: next });
  }
  function updateRegionConfirmed(b) {
    // set all rows to same value
    const next = store.worldRegions.map((r) => ({ ...r, isConfirmed: b }));
    Yw.setStore({ worldRegions: next });
  }

  const regionsAllConfirmed = store.worldRegions.length > 0 && store.worldRegions.every((r) => r.isConfirmed);

  return (
    <Section>
      <DocHead
        kicker="System · Geography and place"
        title="World &"
        titleEm="Geography"
        deck={`The continent is named ${store.projectSettings.worldName}. Everything else \u2014 cities, mountains, rivers, magical zones \u2014 is being decided.`}
        code="WORLD-001"
        codeMeta={{ regions: store.worldRegions.length, map: store.projectSettings.mapStatus }}
      />

      {/* Map placeholder */}
      <SectionMark>The map</SectionMark>
      <div className="paper-card spacious">
        <div className="spread" style={{ marginBottom: 14 }}>
          <div>
            <div className="eyebrow muted">Map · primary plate</div>
            <h3>{store.projectSettings.mapStatus === 'uploaded' ? 'Map plate uploaded' : 'Awaiting White\u2019s physical map'}</h3>
          </div>
          <StatusPill status={store.projectSettings.mapStatus === 'uploaded' ? 'confirmed' : 'pending'} />
        </div>
        <div
          style={{
            height: 360,
            background: 'oklch(0.93 0.018 80 / 0.55)',
            border: '1.5px dashed var(--paper-3)',
            borderRadius: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: 'var(--ink-mute)',
            gap: 10,
          }}
        >
          <Icon name="globe" size={36} stroke={1.2} />
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Map plate \u00b7 1 of 1</div>
          <div style={{ fontStyle: 'italic', fontSize: 16, color: 'var(--ink)' }}>
            Drop White\u2019s map scan here once it exists.
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-mute)' }}>Toggle Map Status from Settings when ready.</div>
        </div>
        <div className="divider"></div>
        <Field label="Map notes \u2014 a scratchpad for either user">
          <TextArea
            value={store.worldNotes}
            onChange={(v) => { Yw.setStore({ worldNotes: v }); }}
            rows={3}
            placeholder="Drop region names, geographic ideas, river guesses, anything that won't fit elsewhere yet."
          />
        </Field>
      </div>

      <SectionMark>Regions</SectionMark>
      <TableBlock
        title="Five regions \u2014 placeholder"
        columns={[
          { key: 'name', label: 'Region name', placeholder: 'Northern' },
          { key: 'climate', label: 'Climate', placeholder: 'Cold, alpine' },
          { key: 'dominantFaction', label: 'Dominant faction', placeholder: 'TBD' },
          { key: 'notableFeature', label: 'Notable feature', placeholder: 'TBD' },
        ]}
        rows={store.worldRegions}
        onChange={updateRegions}
        isConfirmed={regionsAllConfirmed}
        onStatusChange={updateRegionConfirmed}
        emptyHint="The brief seeds five region rows. Edit or add as the map fills in."
      />

      <SectionMark>World summary</SectionMark>
      <div className="stack">
        <ProseBlock
          title="World summary"
          body={store.worldBlocks.summary.content}
          isConfirmed={store.worldBlocks.summary.isConfirmed}
          onChange={(p) => patchBlock('summary', p)}
          emptyHint="Open medieval fantasy sandbox. Anyone is playable. Tone shifts based on player status."
        />
        <ProseBlock
          title="Confirmed world details"
          body={store.worldBlocks.details.content}
          isConfirmed={store.worldBlocks.details.isConfirmed}
          onChange={(p) => patchBlock('details', p)}
          emptyHint="Spellcasting exists. Mythical creatures exist. Reputation is tracked globally and locally."
        />
      </div>

      <SectionMark>Geography</SectionMark>
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))' }}>
        {[
          ['cities', 'Major cities and towns', 'Pending the physical map.'],
          ['mountains', 'Mountains', 'Where, how high, who lives in them.'],
          ['rivers', 'Rivers', 'Which way they flow, what they water, what they cost to cross.'],
          ['forests', 'Forests', 'Old growth, hunting reserve, who owns them.'],
          ['magicalZones', 'Magical zones &amp; anomalies', 'Veilborn enclaves, drained leylines, places to avoid.'],
          ['coastline', 'Coastline', 'Ports, free cities, what the sea takes.'],
        ].map(([key, title, hint]) => (
          <ProseBlock
            key={key}
            title={title}
            body={store.worldBlocks[key].content}
            isConfirmed={store.worldBlocks[key].isConfirmed}
            onChange={(p) => patchBlock(key, p)}
            emptyHint={hint}
          />
        ))}
      </div>

      <SectionMark>World rules</SectionMark>
      <ProseBlock
        title="Fundamental truths"
        body={store.worldBlocks.rules.content}
        isConfirmed={store.worldBlocks.rules.isConfirmed}
        onChange={(p) => patchBlock('rules', p)}
        emptyHint="Magic exists. Mythical creatures roam. Reputation is tracked. The player can rise or fall. Wars can be started, joined, or ended by the player."
      />
    </Section>
  );
}

window.WorldSection = WorldSection;
