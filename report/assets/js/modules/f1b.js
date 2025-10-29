const rawDataF1B = {
  meta: {
    timestampET: "2025-10-29T09:35:00ET",
    module: "F1B · Market Regime",
    moduleVersion: "v2.3-public",
    moduleStatus: "ACTIVE",          // ACTIVE | ERROR | STALE ...
    freshness: "≤ T-1",
    hero_intro:
      "Momentum ancora dominante ma con prime frizioni su credito high beta e curva tassi. Dollar tone ancora forte.",
    hero_disclaimer:
      "F1B descrive lo stato del rischio di mercato nell'orizzonte 3–10 giorni. È materiale informativo e formativo, non è consulenza personalizzata. Fonti: Bloomberg, Reuters, CBOE, FRED, Finviz Premium, ETFdb."
  },

  regime_and_risk: {
    StrategyMode_macro: {
      raw: "MOMENTUM STRONG",
      tone: "green",               // green | yellow | red
      ai_note:
        "Flusso risk-on guidato da tech large-cap e carry su USD. Pullback difensivi assorbiti velocemente."
    },

    RegimeScore: {
      raw: "0.72",
      tone: "green",
      ai_note:
        "Score >0.6 indica appetito rischio ancora elevato: flussi in equity growth e HY credit rimangono costruttivi."
    },

    VolRegime: {
      raw: "VOL SOFT / HEDGE LIGHT",
      tone: "green",
      ai_note:
        "VIX sotto 14, domanda protezione downside bassa; oro stabile, put skew contenuto."
    },

    LiquidityRegimeScore: {
      raw: "NEUTRAL / CURVA STEEPER",
      tone: "yellow",
      ai_note:
        "Curve Treasury si stanno re-steepenando brevemente, segnale di sollievo su funding ma vulnerabile ai dati macro prossimi."
    },

    CreditRiskBlock: {
      raw: "RISK-ON CREDIT HOLDING",
      tone: "green",
      ai_note:
        "High yield e credito beta non mostrano fuga verso qualità. Nessun segnale di stress sistemico immediato."
    },

    FX_Regime: {
      raw: "USD STRONG",
      tone: "red",
      ai_note:
        "Dollar tone resta dominante vs G10 cicliche. Pressione su commodity FX: rischio per ciclo global beta se USD resta così forte."
    },

    RiskWindow: {
      ai_note:
        "Prossimi 3–10 giorni: payrolls + ISM services + aste Treasury a lunga scadenza. Sensibilità elevata a sorpresa macro hawkish. Non operativo."
    }
  },

  breadth_rotation: {
    Breadth_1M: {
      raw: "58%",
      tone: "yellow",
      ai_note:
        "Ampiezza ok ma non esplosiva: metà dei settori fa il grosso del movimento."
    },
    RiskTilt_1M: {
      raw: "CYCLICAL > DEF",
      tone: "green",
      ai_note:
        "Rotazione verso ciclici e growth risk-on: vendono difensivi large-cap per finanziare tech / semiconduttori."
    },
    SmallCapPressure_1W: {
      raw: "SMALLCAP LAG",
      tone: "red",
      ai_note:
        "Micro e small cap ancora sotto pressione vs mid/mega. Il mercato resta top-heavy."
    },
    IndexMomentum_1W: {
      raw: "MEGA TECH LEADS",
      tone: "green",
      ai_note:
        "Momentum guidato da semiconduttori e AI infra. Crypto stabile ma senza leadership marginale."
    },
    SizeBias: {
      raw: "MEGA >> MID >> MICRO",
      tone: "yellow",
      ai_note:
        "Preferenza chiara per capitalizzazioni alte. Il mercato non sta premiando rischio estremo in periferia."
    },

    Leadership: {
      LeadersMultiTF: [
        "Semiconduttori / AI infra",
        "Software large-cap profittevole",
        "Servizi cloud hyperscale"
      ],
      DefensiveLeadership: [
        "Healthcare large-cap qualità",
        "Staples difensivi solo su drawdown intraday"
      ],
      Lagging: [
        "Small cap value domestiche",
        "Commodity cyclical pure-play",
        "REIT high leverage"
      ],
      ai_note:
        "Leadership ancora ultraconcentrata. La parte difensiva gioca solo come hedge tattico su intraday pullback."
    }
  },

  internals_raw: {
    Indices_1W: [
      "NDX +2.1% WoW",
      "SPX +0.9% WoW",
      "RTY -0.6% WoW (small cap)"
    ],
    Futures_Move_1W: [
      "CL -1.2% WoW (oil)",
      "GC flat (gold)",
      "ES +0.8% (S&P fut)",
      "NQ +2.3% (Nasdaq fut)"
    ],
    Curve_UST: [
      "2s10s: -29 bps → -21 bps (less inverted)",
      "Term premium leggermente in rialzo"
    ],
    Vol_USD: [
      "VIX 13.7 → 13.2",
      "DXY +0.4% WoW"
    ],
    ai_note:
      "Curva sta provando a normalizzarsi (meno inversione), VIX compressa, USD forte: combo che regge il tech ma pesa su ciclici globali esposti a FX."
  },

  street_view: {
    T1_MacroNews:
      "Headline macro: 'soft landing' narrativa dominante; i desk macro parlano di growth resiliente e inflazione core gestibile.",
    T1_SellSideNotes:
      "Sell-side (GS/JPM) ancora costruttiva sul large-cap tech come 'defensive growth'. Più cauti sui ciclici profondi.",
    T1_ConsensusTone:
      "Tone consenso: 'buy dips finché il credito tiene'. Nessuna paura sistemica nelle ultime 48h.",
    ai_note:
      "Street non sta prezzando shock di liquidità immediato. Il rischio che citano tutti è solo 'crowding eccessivo su AI mega-cap'."
  },

  sintesi_ai: {
    points: [
      {
        title: "Risk appetite",
        raw: "Il mercato continua a preferire momentum tech / large-cap rispetto a rischio periferico.",
        ai_note: "Non è un consiglio operativo."
      },
      {
        title: "Fragilità",
        raw: "USD forte e breadth debole nelle small cap restano le principali fragilità cicliche.",
        ai_note: "Questa debolezza periferica spesso precede fasi di respiro."
      }
    ],
    summary:
      "Regime tuttora pro-risk, guidato da leadership concentrata in mega tech. Nessun segnale di stress credito sistemico a T+3/T+10, ma dipendenza elevata da narrativa 'soft landing' e da USD forte. Questa lettura è puramente informativa e non sostituisce consulenza personalizzata."
  },

  audit_quality: {
    AuditPathID: "AUDIT-F1B-2025-10-29T09:35ET",
    SourcesTier1: [
      "Bloomberg",
      "Reuters",
      "CBOE",
      "FRED",
      "Finviz Premium",
      "ETFdb"
    ],
    Freshness: "T-1",
    ModuleStatus: "OK",
    QualityMetrics: {
      FreshnessScore: {
        raw: "GREEN / T-1",
        tone: "green",
        ai_note: "Dati equity/vol aggiornati alle ultime chiusure US + pre-open FX."
      },
      ConfidenceFinal: {
        raw: "0.84",
        tone: "green",
        ai_note: "Score interno >0.8: coerenza segnali alta."
      },
      DataIntegrity: {
        raw: "CLEAN",
        tone: "green",
        ai_note: "Nessun buco feed nei settori chiave."
      },
      FeedSync: {
        raw: "SYNCED",
        tone: "green",
        ai_note: "Cross-check CBOE/Bloomberg combacia con feed interno."
      }
    }
  },

  mifid: {
    disclaimer:
      "Queste informazioni hanno finalità puramente educative e non costituiscono consulenza in materia di investimenti ai sensi della Direttiva MiFID II. Non tengono conto degli obiettivi d'investimento, della situazione finanziaria o delle esigenze specifiche di alcun individuo. Parla sempre con un intermediario autorizzato prima di prendere decisioni operative."
  }
};
