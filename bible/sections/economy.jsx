/* Game Bible — sections/economy.jsx */
const Ye = window.YSTC;

function EconomySection() {
  const store = Ye.useStore();
  const b = store.economyBlocks;
  function patch(key, partial) {
    Ye.setStore({ economyBlocks: { ...b, [key]: { ...b[key], ...partial } } });
    Ye.logActivity('Economy', 'edited', key);
  }
  function setRows(key, rows) {
    Ye.setStore({ economyBlocks: { ...b, [key]: { ...b[key], rows } } });
  }
  return (
    <Section>
      <DocHead
        kicker="System · Coin and consequence"
        title="Economy &"
        titleEm="Trade"
        deck="A merchant can destabilize the empire badly enough to trigger rebellion. That is the framing. The specifics are still being decided."
        code="ECON-001"
      />

      <SectionMark>Money &amp; goods</SectionMark>
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))' }}>
        <TableBlock
          title="Currency"
          columns={[
            { key: 'coin', label: 'Coin', placeholder: 'Crown' },
            { key: 'value', label: 'Value', placeholder: '100 silver' },
            { key: 'commonName', label: 'Common name', placeholder: '\u201CRoyal\u201D' },
            { key: 'usedBy', label: 'Used by', placeholder: 'Nobility' },
          ]}
          rows={b.currency.rows}
          isConfirmed={b.currency.isConfirmed}
          onChange={(rows) => setRows('currency', rows)}
          onStatusChange={(v) => patch('currency', { isConfirmed: v })}
          emptyHint=""
        />
        <TableBlock
          title="Trade goods"
          columns={[
            { key: 'good', label: 'Good', placeholder: 'Salt' },
            { key: 'origin', label: 'Origin region', placeholder: 'Coastal' },
            { key: 'rarity', label: 'Rarity', placeholder: 'Common' },
            { key: 'value', label: 'Value', placeholder: 'High inland' },
          ]}
          rows={b.tradeGoods.rows}
          isConfirmed={b.tradeGoods.isConfirmed}
          onChange={(rows) => setRows('tradeGoods', rows)}
          onStatusChange={(v) => patch('tradeGoods', { isConfirmed: v })}
          emptyHint="Salt, wool, iron, parchment, exotic spice — what moves and what it costs."
        />
      </div>

      <SectionMark>The market</SectionMark>
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        <ProseBlock title="Player-owned shops" body={b.shops.content} isConfirmed={b.shops.isConfirmed}
          onChange={(p) => patch('shops', p)}
          emptyHint="Rules for market stalls and full stores, location effects on profitability, staffing, taxation, robbery, destruction." />
        <ProseBlock title="Guilds and trade organizations" body={b.guilds.content} isConfirmed={b.guilds.isConfirmed}
          onChange={(p) => patch('guilds', p)}
          emptyHint="Smiths, masons, scribes, brokers — who they are, how they keep prices steady, what they cost to join." />
        <ProseBlock title="Black market and illegal trade" body={b.blackMarket.content} isConfirmed={b.blackMarket.isConfirmed}
          onChange={(p) => patch('blackMarket', p)}
          emptyHint="Contraband, who deals in it, risk versus reward." />
        <ProseBlock title="Economic events" body={b.events.content} isConfirmed={b.events.isConfirmed}
          onChange={(p) => patch('events', p)}
          emptyHint="Droughts, wars, plagues, harvests — how they shift prices and who suffers first." />
      </div>
    </Section>
  );
}

window.EconomySection = EconomySection;
