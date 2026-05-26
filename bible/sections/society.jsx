/* Game Bible — sections/society.jsx */
const Ys = window.YSTC;

function SocietySection() {
  const store = Ys.useStore();
  function setClasses(rows) { Ys.setStore({ socialClasses: rows }); Ys.logActivity('Society', 'edited', 'social class table'); }
  function patchBlock(key, partial) {
    Ys.setStore({ socialBlocks: { ...store.socialBlocks, [key]: { ...store.socialBlocks[key], ...partial } } });
    Ys.logActivity('Society', 'edited', key);
  }
  function setNote(v) { Ys.setStore({ socialNote: v }); }
  return (
    <Section>
      <DocHead
        kicker="System · Standing and reputation"
        title="Society &"
        titleEm="Reputation"
        deck="The Brain establishes the hierarchy. Reputation mechanics are confirmed in principle; specifics still being decided."
        code="SOC-001"
      />

      <SectionMark>Social classes</SectionMark>
      <TableBlock
        title="Class hierarchy"
        columns={[
          { key: 'className', label: 'Class', placeholder: 'Noble' },
          { key: 'description', label: 'Description' },
          { key: 'privileges', label: 'Starting privileges' },
          { key: 'limitations', label: 'Limitations' },
        ]}
        rows={store.socialClasses}
        onChange={setClasses}
        isConfirmed={store.socialClasses.every((r) => r.isConfirmed)}
        onStatusChange={(v) => setClasses(store.socialClasses.map((r) => ({ ...r, isConfirmed: v })))}
        emptyHint="Ordered lowest to highest."
      />

      <article className="paper-card" style={{ marginTop: 18 }}>
        <div className="card-head">
          <div>
            <div className="eyebrow muted">Magic note · explicit</div>
            <h3>Magic users bypass this hierarchy.</h3>
          </div>
        </div>
        <TextArea value={store.socialNote} onChange={setNote} rows={3} />
      </article>

      <SectionMark>Reputation system</SectionMark>
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))' }}>
        {['townRep','factionRep','worldRep','culture','religion'].map((k) => (
          <ProseBlock
            key={k}
            title={store.socialBlocks[k].title}
            body={store.socialBlocks[k].content}
            isConfirmed={store.socialBlocks[k].isConfirmed}
            onChange={(p) => patchBlock(k, p)}
            emptyHint={
              k === 'townRep'    ? 'Local effects \u2014 shop prices, quest access, guard behavior, marriage eligibility.' :
              k === 'factionRep' ? 'Alliances, military support, trade deals, assassination attempts, bounties.' :
              k === 'worldRep'   ? 'Notoriety triggers when the player makes the whole world take notice.' :
              k === 'culture'    ? 'Greetings, table manners, taboos, how each region speaks of outsiders.' :
                                   'Faiths the empire recognises, what the underclass actually prays to.'
            }
          />
        ))}
      </div>
    </Section>
  );
}

window.SocietySection = SocietySection;
