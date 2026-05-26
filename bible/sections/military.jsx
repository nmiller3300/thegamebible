/* Game Bible — sections/military.jsx */
const Yw_ = window.YSTC;

function MilitarySection() {
  const store = Yw_.useStore();
  const b = store.militaryBlocks;
  function patch(key, partial) {
    Yw_.setStore({ militaryBlocks: { ...b, [key]: { ...b[key], ...partial } } });
    Yw_.logActivity('Military', 'edited', key);
  }
  function setStructure(rows) {
    Yw_.setStore({ militaryStructure: rows });
  }
  return (
    <Section>
      <DocHead
        kicker="System · Wars and the violence of state"
        title="Military &"
        titleEm="Warfare"
        deck="Politics must feel dangerous and betrayal must be possible. Wars reshape the world."
        code="WAR-001"
      />

      <SectionMark>Structure</SectionMark>
      <TableBlock
        title="Military ranks"
        columns={[
          { key: 'rank', label: 'Rank', placeholder: 'Captain' },
          { key: 'role', label: 'Role', placeholder: 'Field command' },
          { key: 'numbers', label: 'Typical numbers', placeholder: 'Dozens per legion' },
        ]}
        rows={store.militaryStructure}
        onChange={setStructure}
        isConfirmed={store.militaryStructure.some((r) => r.isConfirmed)}
        onStatusChange={(v) => setStructure(store.militaryStructure.map((r) => ({ ...r, isConfirmed: v })))}
        emptyHint="From foot soldier to general \u2014 who commands what, and how many."
      />

      <SectionMark>Conflict</SectionMark>
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        <ProseBlock
          title="Starting a war \u2014 player triggers"
          body={b.startingWar.content}
          isConfirmed={b.startingWar.isConfirmed}
          onChange={(p) => patch('startingWar', p)}
          emptyHint="Assassination, seizing territory, rallying a faction, breaking a treaty, economic sabotage."
        />
        <ProseBlock
          title="Joining a war \u2014 player options"
          body={b.joiningWar.content}
          isConfirmed={b.joiningWar.isConfirmed}
          onChange={(p) => patch('joiningWar', p)}
          emptyHint="Enlist, mercenary, pledge to a king, lead a rebel faction."
        />
        <ProseBlock
          title="Battle system notes"
          body={b.battleNotes.content}
          isConfirmed={b.battleNotes.isConfirmed}
          onChange={(p) => patch('battleNotes', p)}
          emptyHint="How fights resolve. Combat scope, command, casualty model. TBD."
        />
        <ProseBlock
          title="War consequences"
          body={b.consequences.content}
          isConfirmed={b.consequences.isConfirmed}
          onChange={(p) => patch('consequences', p)}
          emptyHint="Territory changes hands. Cities fall. Famine follows. Reputation shifts. New rulers rise."
        />
      </div>
    </Section>
  );
}

window.MilitarySection = MilitarySection;
