import { useState, useEffect, useMemo } from "react";

// ————————————————————————————————————————————————————————
// Trainings-Dashboard v11 — Jan · Phase 1 Basis · 12.06.–02.08.2026
// Synchron mit der iPhone-PWA: Kraft separat, Fortschritts-Graphen,
// W2-Anpassung (Fortbildung Sa+So), Athletenprofil-Regel.
// ————————————————————————————————————————————————————————

const Dz2="Ziel: 125–170 W · Puls 128–158. Locker genug, um durch die Nase zu atmen / Sätze sprechen zu können.";
const Dsprint="Sprints: 5×15″ maximaler Antritt aus dem Rollen, hohe Trittfrequenz, alle 10–12 min · dazwischen Z2. Kein Pacing — voll.";
const Dkraft1="Maximalkraft-Basis: Kniebeuge + Kreuzheben (oder Beinpresse) 4×5–6 schwer · Bankdrücken/Rudern 3×6–8 · Rumpf 10 min. 3 min Satzpause.";
const Dkraft2="Zweite Krafteinheit: Ausfallschritte 3×8/Seite · Hip Thrust 3×8 · Zugübung 3×8 · Rumpf/Stabi 10–15 min. Etwas leichter als Kraft 1.";
const DlangFuel="Verpflegung: 60–80 g KH/h ab Stunde 1 · 500–750 ml/h trinken · Pacing strikt Z2, am Berg notfalls schalten statt drücken.";
const Dretest="Protokoll: 20′ einrollen mit 3×1′ zügig → 5′ locker → 20 min all-out (gleichmäßig!) → FTP = Ø-Watt × 0,95. Alternativ Ramp-Test. Ausgeruht, vormittags, gut gefrühstückt.";

const TYPE={lang:{label:"Lange Gravel",c:"var(--lang)"},z2:{label:"Z2 Grundlage",c:"var(--z2)"},kraft:{label:"Kraft",c:"var(--kraft)"},intens:{label:"Test / Intensität",c:"var(--intens)"},ruhe:{label:"Ruhe",c:"var(--ruhe)"}};

const WEEK_DATES={W1:["2026-06-12","2026-06-14"],W2:["2026-06-15","2026-06-21"],W3:["2026-06-22","2026-06-28"],W4:["2026-06-29","2026-07-05"],W5:["2026-07-06","2026-07-12"],W6:["2026-07-13","2026-07-19"],W7:["2026-07-20","2026-07-26"],W8:["2026-07-27","2026-08-02"],W9:["2026-08-03","2026-08-09"],W10:["2026-08-10","2026-08-16"],W11:["2026-08-17","2026-08-23"],W12:["2026-08-24","2026-08-30"]};

const WEEKS=[
 {id:"W1",range:"8.–14. Jun",tag:"Einstieg",note:"Auftaktwoche · Kraftblock + Wochenend-Ausfahrten",days:[
  {d:"Mo 8.",type:"kraft",title:"Kraft 1",sub:"",h:1,detail:Dkraft1},
  {d:"Di 9.",type:"kraft",title:"Kraft 2",sub:"",h:1,detail:Dkraft2},
  {d:"Mi 10.",type:"kraft",title:"Kraft 3",sub:"",h:1,detail:"Dritte Krafteinheit der Woche (71 min). Dazu morgens lockerer Z2-Lauf 5,1 km — unten als Bonus geführt."},
  {d:"Do 11.",type:"ruhe",title:"Ruhetag",sub:"",h:0},
  {d:"Fr 12.",type:"ruhe",title:"Ruhetag",sub:"Sommerfest",h:0},
  {d:"Sa 13.",type:"lang",title:"Lange Gravel 2,5–3 h",sub:"Z2 · Soll 2,5 h",h:2.5,detail:"Erster langer Block der Phase — bewusst ruhig. "+Dz2+" "+DlangFuel},
  {d:"So 14.",type:"lang",title:"Aubachtal-Trailrunde",sub:"optional · Trailrunde (Tempo/Z3)",h:1.85,opt:true,detail:"Optionale Zusatzausfahrt (zählt nicht ins Soll, aber ins Ist). Aubachtal-Trailrunde, Tempo/Z3, RPE ~7."}]},
 {id:"W2",range:"15.–21. Jun",tag:"Basis",note:"2 Nachtdienste · Fortbildung Sa+So (lange Ausfahrt entfällt)",days:[
  {d:"Mo 15.",type:"z2",title:"Z2 75′ + Sprints",sub:"abends nach BMW-Abholung ~17:30",h:1.25,detail:"15′ einrollen → Hauptteil Z2 mit eingestreuten Sprints → 10′ ausrollen. "+Dsprint},
  {d:"Di 16.",type:"z2",title:"Z2 90–120′ vormittags",sub:"Mitteldistanz · Soll 90′",shift:"Nachtdienst",h:1.5,detail:Dz2+" MITTELDISTANZ: zweite längere aerobe Einheit der Woche. Spätestens 12 Uhr fertig."},
  {d:"Mi 17.",type:"ruhe",actual:"kraft",title:"Post-Call · Ruhe → Kraft gemacht",sub:"Do-Kraft hierher vorgezogen, 56 min",h:0,detail:"Eigentlich Post-Call-Ruhetag. Abends die für Do geplante Kraft-Einheit vorgezogen (56 min) — die zählt beim Do-Soll als erfüllt."},
  {d:"Do 18.",type:"kraft",actual:"z2",title:"Kraft 1 → Rad gefahren",sub:"Kraft auf Mi vorgezogen · Rad als Bonus · Dienst ab 14:45",shift:"Nachtdienst",h:0,detail:"Diese Kraft-Einheit wurde auf Mi 17. vorgezogen (dort erledigt). Am freien Vormittag stattdessen eine ruhige Z2-Ausfahrt gefahren (zählt als Bonus ins Ist, nicht ins Soll). "+Dkraft1},
  {d:"Fr 19.",type:"ruhe",title:"Post-Call · Ruhe",sub:"Fortbildung",h:0},
  {d:"Sa 20.",type:"ruhe",title:"Ruhe",sub:"Fortbildung ganztägig (Sa+So)",h:0},
  {d:"So 21.",type:"ruhe",title:"Ruhe",sub:"Fortbildung ganztägig — lange Ausfahrt entfällt, nicht nachholen",h:0}]},
 {id:"W3",range:"22.–28. Jun",tag:"Entlastung",note:"Spätdienstwoche · Slot 9–11 Uhr · FTP-RETEST Di",days:[
  {d:"Mo 22.",type:"kraft",title:"Kraft 1 · 9–11 Uhr",sub:"",shift:"Spätdienst",h:1,detail:Dkraft1},
  {d:"Di 23.",type:"intens",title:"FTP-RETEST",sub:"vormittags, ausgeruht",shift:"Spätdienst",h:1,detail:Dretest},
  {d:"Mi 24.",type:"ruhe",actual:"lang",title:"Ruhe → große Ausfahrt",sub:"spontane 57-km-Tour (Bonus)",shift:"Spätdienst",h:0,detail:"Eigentlich Ruhetag in der Entlastungswoche. Stattdessen große Ausfahrt (146 min, 57 km, 515 hm) — zählt als Bonus ins Ist, nicht ins Soll."},
  {d:"Do 25.",type:"z2",title:"Z2 75′ · 9–11 Uhr",sub:"neue Zonen ab heute",shift:"Spätdienst",h:1.25,detail:"Erste Einheit mit den frischen Zonen aus dem Retest — bewusst ans untere Z2-Ende halten und Gefühl kalibrieren."},
  {d:"Fr 26.",type:"kraft",title:"Kraft (vom Sa getauscht)",sub:"Z2 lief Fr, Kraft Sa — Positionen getauscht",shift:"Spätdienst",h:1,detail:"Fr/Sa getauscht: Die Z2-Einheit lief am Fr, die Kraft am Sa. In der Bilanz erfüllt der Tausch beide Soll-Positionen (Kraft hier, Z2 am Sa). "+Dkraft2},
  {d:"Sa 27.",type:"z2",title:"Z2 90′ (vom Fr getauscht)",sub:"Z2 lief bereits Fr (61′ + Sprints)",shift:"Spätdienst",h:1.5,detail:"Fr/Sa getauscht: Die Z2 lief am Fr (61′, mustergültig kontrolliert, Ø140 bpm). "+Dz2},
  {d:"So 28.",type:"ruhe",title:"Ruhe",sub:"",shift:"Spätdienst",h:0}]},
 {id:"W4",range:"29. Jun – 5. Jul",tag:"Basis",note:"Nachtdienst Mi 1.→Do 2. · So Tagdienst · Sa lange Ausfahrt",days:[
  {d:"Mo 29.",type:"z2",title:"Z2 105–120′ Mitteldistanz",sub:"freier Tag · Soll 105′",h:1.75,detail:"Längste Wocheneinheit unter der Woche — reine Z2-Dauer (keine Sprints diese Woche). "+Dz2},
  {d:"Di 30.",type:"kraft",title:"Kraft 1",sub:"abends ab ~17 Uhr",h:1,detail:Dkraft1},
  {d:"Mi 1.7.",type:"z2",title:"Z2 90′ vormittags",sub:"Mitteldistanz · Nachtdienst ab 14:45",shift:"Nachtdienst",h:1.5,detail:Dz2+" MITTELDISTANZ: zweite längere aerobe Einheit der Woche. Vormittags vor dem Nachtdienst."},
  {d:"Do 2.",type:"ruhe",title:"Post-Call · Ruhe",sub:"nach Nachtdienst — ausnahmslos frei",shift:"Post-Call",h:0},
  {d:"Fr 3.",type:"z2",title:"Z2 60′ locker",sub:"abends · normaler Arbeitstag",h:1,detail:Dz2+" Bewusst kurz und leicht — morgen ist die lange Ausfahrt."},
  {d:"Sa 4.",type:"lang",title:"Lange Gravel 3–3,5 h",sub:"Z2 · Soll 3 h",h:3,detail:Dz2+" "+DlangFuel},
  {d:"So 5.",type:"ruhe",title:"Ruhe",sub:"Tagdienst 7:30–15:30",shift:"Tagdienst",h:0}]},
 {id:"W5",range:"6.–12. Jul",tag:"Basis",note:"Nachtdienst Mi 8.→Do 9. · Fr normaler Arbeitstag · WE frei",days:[
  {d:"Mo 6.",type:"z2",title:"Z2 75′",sub:"abends",h:1.25,detail:Dz2},
  {d:"Di 7.",type:"kraft",title:"Kraft 1",sub:"abends",h:1,detail:Dkraft1},
  {d:"Mi 8.",type:"z2",title:"Z2 90′ vormittags",sub:"Mitteldistanz · Nachtdienst ab 14:45",shift:"Nachtdienst",h:1.5,detail:Dz2+" MITTELDISTANZ: zweite längere aerobe Einheit der Woche. Vormittags vor dem Nachtdienst."},
  {d:"Do 9.",type:"ruhe",title:"Post-Call · Ruhe",sub:"nach Nachtdienst — ausnahmslos frei",shift:"Post-Call",h:0},
  {d:"Fr 10.",type:"z2",title:"Z2 60′ + Sprints",sub:"abends · normaler Arbeitstag",h:1,detail:Dz2+" "+Dsprint},
  {d:"Sa 11.",type:"lang",title:"Lange Gravel 4 h",sub:"erste 4-h-Ausfahrt",h:4,detail:"Sprung auf 4 h. "+DlangFuel+" Route mit Abkürzungsoption planen, falls die Beine nach 3 h zumachen."},
  {d:"So 12.",type:"z2",title:"Z2 60–75′ ganz locker",sub:"Recovery-Spin · Soll 60′",h:1,detail:"Unteres Z2 oder Z1, flache Runde. Optional kurz Kraft 2 dranhängen — oder komplett frei, wenn die Beine schwer sind."}]},
 {id:"W6",range:"13.–19. Jul",tag:"Basis",note:"dienstfreie Woche · freies Wochenende",days:[
  {d:"Mo 13.",type:"ruhe",title:"Ruhetag",sub:"nach dem Wochenendblock",h:0,detail:"Kein Dienst mehr — bleibt trotzdem Ruhetag: Sa 4 h + So-Spin sind genug Reiz, Anpassung passiert in der Pause."},
  {d:"Di 14.",type:"z2",title:"Z2 90′",sub:"Mitteldistanz · abends",h:1.5,detail:Dz2+" Etwas länger, dafür ohne Sprints (jede zweite Woche)."},
  {d:"Mi 15.",type:"kraft",title:"Kraft 1",sub:"abends",h:1,detail:Dkraft1},
  {d:"Do 16.",type:"z2",title:"Z2 90′",sub:"abends",h:1.5,detail:Dz2},
  {d:"Fr 17.",type:"kraft",title:"Kraft 2 kurz oder Ruhe",sub:"vor dem langen Samstag",h:1,detail:Dkraft2},
  {d:"Sa 18.",type:"lang",title:"Lange Gravel 4 h",sub:"Material-Test: 50-mm-Frontreifen",h:4,detail:Dz2+" "+DlangFuel+" MATERIAL-TEST: 50-mm-Frontreifen (G-One RS 50 oder Cinturato Gravel RC 50) vorher montieren, Druck vorne ~1,5–1,7 bar antesten und Fahrgefühl notieren."},
  {d:"So 19.",type:"z2",title:"Z2 60′ locker oder frei",sub:"",h:1,detail:"Reine Fettstoffwechsel-/Regenerationsfahrt am unteren Z2-Rand. Wenn müde: streichen, nicht quälen."}]},
 {id:"W7",range:"20.–26. Jul",tag:"Basis",note:"Nachtdienst Sa 25.→So 26. · WE fällt weg, lange Ausfahrt entfällt (Regel)",days:[
  {d:"Mo 20.",type:"z2",title:"Z2 90′",sub:"",h:1.5,detail:Dz2},
  {d:"Di 21.",type:"kraft",title:"Kraft 1",sub:"",h:1,detail:Dkraft1},
  {d:"Mi 22.",type:"z2",title:"Z2 90′ + Sprints",sub:"",h:1.5,detail:Dz2+" "+Dsprint},
  {d:"Do 23.",type:"z2",title:"Z2 60′ ganz locker",sub:"",h:1,detail:"Aktive Erholung mitten in der großen Woche — unteres Z2 oder Z1."},
  {d:"Fr 24.",type:"kraft",title:"Kraft 2",sub:"",h:1,detail:Dkraft2},
  {d:"Sa 25.",type:"z2",title:"Z2 60–75′ vormittags",sub:"Nachtdienst ab 14:45 · nur vormittags",shift:"Nachtdienst",h:1.25,detail:"Nachtdienst-Tag: nur eine ruhige Z2-Einheit am Vormittag möglich. Die lange Ausfahrt entfällt diese Woche ersatzlos (Wochenende durch Nachtdienst belegt — nicht planbar, kein Nachholen). "+Dz2},
  {d:"So 26.",type:"ruhe",title:"Post-Call · Ruhe",sub:"nach Nachtdienst — ausnahmslos frei",shift:"Post-Call",h:0,detail:"Nach dem Nachtdienst (2–3 h Schlaf): absoluter Ruhetag. Regenerieren, nachschlafen, essen."}]},
 {id:"W8",range:"27. Jul – 2. Aug",tag:"Entlastung",note:"Zahnarzt Mo · Nachtdienst Do 30.→Fr 31.",days:[
  {d:"Mo 27.",type:"z2",title:"Z2 60′ locker",sub:"Zahnarzt · abends",h:1,detail:Dz2+" Locker, falls der Zahnarzttermin es zulässt — sonst streichen."},
  {d:"Di 28.",type:"z2",title:"Z2 60′",sub:"abends",h:1,detail:Dz2},
  {d:"Mi 29.",type:"kraft",title:"Kraft 1",sub:"abends · normaler Arbeitstag",h:1,detail:Dkraft1},
  {d:"Do 30.",type:"z2",title:"Z2 60′ vormittags",sub:"Nachtdienst ab 14:45 · nur vormittags",shift:"Nachtdienst",h:1,detail:Dz2+" Vormittags vor dem Nachtdienst. Ohne Sprints (Entlastungswoche)."},
  {d:"Fr 31.",type:"ruhe",title:"Post-Call · Ruhe",sub:"nach Nachtdienst — ausnahmslos frei",shift:"Post-Call",h:0,detail:"Nach dem Nachtdienst: absoluter Ruhetag."},
  {d:"Sa 1.8.",type:"z2",title:"Z2 90′",sub:"Wochenende frei",h:1.5,detail:Dz2+" Wochenende frei."},
  {d:"So 2.",type:"z2",title:"Z2 90′ locker",sub:"August-Plan folgt",h:1.5,detail:Dz2}]},
 {id:"W9",range:"3.–9. Aug",tag:"Basis",note:"dienstfrei · Volumen-Basiswoche",days:[
  {d:"Mo 3.",type:"z2",title:"Z2 90′",sub:"Mitteldistanz",h:1.5,detail:Dz2+" MITTELDISTANZ."},
  {d:"Di 4.",type:"kraft",title:"Kraft 1",sub:"",h:1,detail:Dkraft1},
  {d:"Mi 5.",type:"z2",title:"Z2 90′ + Sprints",sub:"",h:1.5,detail:Dz2+" "+Dsprint},
  {d:"Do 6.",type:"kraft",title:"Kraft 2",sub:"",h:1,detail:Dkraft2},
  {d:"Fr 7.",type:"ruhe",title:"Ruhetag",sub:"vor der langen Ausfahrt frisch",h:0,detail:"Fester wöchentlicher Ruhetag — bewusst vor dem langen Samstag, damit die Beine frisch sind."},
  {d:"Sa 8.",type:"lang",title:"Lange Gravel 3,5 h",sub:"",h:3.5,detail:"Aerobe Langausfahrt. "+DlangFuel},
  {d:"So 9.",type:"z2",title:"Z2 60′ Recovery",sub:"Soll 60′",h:1,detail:"Unteres Z2/Z1, locker."}]},
 {id:"W10",range:"10.–16. Aug",tag:"Schwelle",note:"Phase-2-Einstieg: erste Sweet-Spot-Woche · Nachtdienst Sa 15.→So 16.",days:[
  {d:"Mo 10.",type:"z2",title:"Z2 75′",sub:"",h:1.25,detail:Dz2},
  {d:"Di 11.",type:"intens",title:"Sweet Spot 3×12′",sub:"erste SS-Einheit · 180–193 W / Puls ~165–175",h:1.25,detail:"Phase-2-Einstieg. 3×12 min Sweet Spot (88–94% FTP = 180–193 W) mit 4 min Pause. Nach 15 min Einrollen. Kontrolliert, nicht überpacen — Ziel ist wiederholbare Schwellennähe."},
  {d:"Mi 12.",type:"z2",title:"Z2 90′",sub:"Mitteldistanz",h:1.5,detail:Dz2+" MITTELDISTANZ."},
  {d:"Do 13.",type:"kraft",title:"Kraft 1",sub:"Maximalkraft",h:1,detail:Dkraft1+" Phase 2: Richtung Maximalkraft (schwerer, weniger Wdh.)."},
  {d:"Fr 14.",type:"z2",title:"Z2 60′ locker",sub:"",h:1,detail:Dz2},
  {d:"Sa 15.",type:"z2",title:"Z2 60–75′ vormittags",sub:"Nachtdienst ab 14:45 · Mariä Himmelfahrt",shift:"Nachtdienst",h:1.25,detail:"Nachtdienst-Tag: nur Z2 am Vormittag. Die lange Ausfahrt entfällt diese Woche (Wochenende durch Nachtdienst belegt). SS-Reiz kam schon Di. "+Dz2},
  {d:"So 16.",type:"ruhe",title:"Post-Call · Ruhe",sub:"nach Nachtdienst — ausnahmslos frei",shift:"Post-Call",h:0,detail:"Nach dem Nachtdienst: absoluter Ruhetag."}]},
 {id:"W11",range:"17.–23. Aug",tag:"Übergang",note:"Forschung Do 20. · Sylt-Anreise Sa 22.",days:[
  {d:"Mo 17.",type:"z2",title:"Z2 75′ + Sprints",sub:"",h:1.25,detail:Dz2+" "+Dsprint},
  {d:"Di 18.",type:"intens",title:"Sweet Spot 3×15′",sub:"180–193 W",h:1.25,detail:"Steigerung ggü. W10: 3×15 min Sweet Spot, 4 min Pause."},
  {d:"Mi 19.",type:"kraft",title:"Kraft 1",sub:"",h:1,detail:Dkraft1},
  {d:"Do 20.",type:"z2",title:"Z2 60′ locker",sub:"Forschung",h:1,detail:Dz2+" Forschungstag — locker halten."},
  {d:"Fr 21.",type:"z2",title:"Z2 60′ locker",sub:"letzter Tag vor Urlaub",h:1,detail:Dz2+" Letzte Einheit vor der Abreise — locker."},
  {d:"Sa 22.",type:"ruhe",title:"Anreise Sylt",sub:"Reisetag — keine Fahrt",h:0,detail:"Anreise nach Sylt — Reisetag, kein Training."},
  {d:"So 23.",type:"z2",title:"Sylt: erste Ausfahrt nach Wetter",sub:"optional · wetterabhängig",h:1.5,opt:true,detail:"Optional (zählt nicht ins Soll). Erste Urlaubsausfahrt, je nach Wetter und Wind. Kein Druck — gerade erst angereist."}]},
 {id:"W12",range:"24.–30. Aug",tag:"Basis (Urlaub)",note:"Sylt-Urlaub · kleines Grund-Soll (~4h), Rest optional · wetterabhängig",days:[
  {d:"Mo 24.",type:"z2",title:"Sylt: Z2 nach Wetter",sub:"flexibel · Grund-Soll",h:1,detail:"Wetterabhängige Z2-Ausfahrt. Insel-Runden, Wind einplanen. Zählt zum kleinen Grund-Soll der Urlaubswoche."},
  {d:"Di 25.",type:"z2",title:"Sylt: locker/Ruhe",sub:"optional · flexibel",h:1,opt:true,detail:"Optional (zählt nicht ins Soll). Nach Lust und Wetter — auch Pause ok, ist Urlaub."},
  {d:"Mi 26.",type:"lang",title:"Sylt: längere Tour nach Wetter",sub:"flexibel · wenn Wetter passt",h:3,detail:"Wenn das Wetter mitspielt, die längere Urlaubstour. Sonst verschieben. "+DlangFuel},
  {d:"Do 27.",type:"z2",title:"Sylt: locker/Ruhe",sub:"optional · flexibel",h:1,opt:true,detail:"Optional (zählt nicht ins Soll). Locker oder frei."},
  {d:"Fr 28.",type:"z2",title:"Sylt: Z2 nach Wetter",sub:"optional · flexibel",h:1.5,opt:true,detail:"Optional (zählt nicht ins Soll). Z2-Ausfahrt nach Wetter."},
  {d:"Sa 29.",type:"ruhe",title:"Sylt/Rückreise",sub:"flexibel",h:0,detail:"Je nach Abreise — optional kurze Runde."},
  {d:"So 30.",type:"ruhe",title:"Rückreise / Puffer",sub:"",h:0,detail:"Reise/Erholung."}]}
];

const RULES=[
 {cat:"Dienste",text:"📖 KALENDER LESEN (Schritt für Schritt, immer in dieser Reihenfolge): (1) Ein farbiger Dienst-Balken, der sich über MEHRERE Tage zieht = NACHTDIENST. Der ERSTE Tag ist der Dienst-Tag (Dienstbeginn 14:45), der LETZTE Tag des Balkens ist der Post-Call-Ruhetag. Beispiel: Balken Do→Fr = Nachtdienst Do, Post-Call-Ruhe Fr. (2) Ein Dienst-Balken, der nur EINEN Tag belegt = TAGDIENST (7:30–15:30). Kein Post-Call danach. (3) JEDER Tag OHNE Dienst-Balken ist ein NORMALER ARBEITSTAG (werktags) bzw. FREIER TAG (Wochenende) — egal welcher Wochentag. NIE einen Dienst annehmen, der nicht im Kalender als Balken steht."},
 {cat:"Dienste",text:"⚙️ WAS GEHT AN WELCHEM TAG (Konsequenz aus dem Kalender): NACHTDIENST-Tag → nur Z2 + kurze Sprints am Vormittag (bis 12 Uhr), KEINE lange Ausfahrt, KEINE Kraft am Abend. POST-CALL-Tag → IMMER Ruhetag, ausnahmslos, kein Training. TAGDIENST → nur Z2 am Vormittag, kein langer Block. NORMALER ARBEITSTAG → Training abends ab 17 Uhr (Z2, Kraft, Intervalle). FREIER WOCHENENDTAG → lange Ausfahrt möglich. WICHTIG: Lange Ausfahrt NUR an freien Wochenendtagen; fällt das Wochenende durch Dienst weg, entfällt die lange Ausfahrt ERSATZLOS (kein Nachholen, nicht planbar)."},
 {cat:"Dienste",text:"Nachtdienst 14:45 → ~9:00 Folgetag (2–3 h Schlaf). Post-Call = Ruhetag, ausnahmslos."},
 
 
 {cat:"Dienste",text:"Spätdienst 13:00–21:30 (oft bis 23 Uhr): Trainingsslot 9–11 Uhr, reduzierter Umfang. Spätdienstwochen zählen als Entlastung."},
 {cat:"Dienste",text:"Spätdienst-Unsicherheit: An Spätdienst-Tagen ist morgens nicht absehbar, wie lang der Tag wird und ob die Folgetage trainierbar bleiben. Daher gilt — die sichere Einheit am freien Vormittag mitnehmen, auch wenn sie nicht ins geplante Tagesraster passt. Eine garantierte Einheit jetzt schlägt mehrere geplante, die der Dienst auffrisst. Chance ergreifen statt auf den perfekten Slot warten; die Mehrleistung wird als Bonus erfasst, nicht als Soll-Verfehlung an anderen Tagen."},
 {cat:"Dienste",text:"Reguläre Arbeitstage 6:45–16:30: Einheiten abends ab ~17 Uhr."},
 {cat:"Training",text:"Lange Ausfahrten nur an freien Wochenendtagen."},
 {cat:"Training",text:"Mindestens 1 echter Ruhetag pro Woche (type ruhe) — fest eingeplant, nicht optional. Dient der Regeneration und ist Trainingslehre-Standard. Post-Call-Tage zählen als Ruhetag. In dienstfreien Volumenwochen bewusst einen Werktag (ideal vor der langen Ausfahrt) freihalten, damit nicht 7 Tage am Stück trainiert wird."},
 {cat:"Training",text:"Jede 4. Woche Entlastung (−30–40 % Umfang)."},
 {cat:"Training",text:"Wenn der Dienstplan eine Woche zerschießt: Einheiten streichen, nicht nachholen."},
 {cat:"Training",text:"Profil: kräftige Beine, aerobe Baustelle (starke Sprintwerte, schwächere Dauerleistung). Daher Z2 IMMER nach Puls steuern (128–158) — die Beine verleiten sonst zu zu hohen Watt und der Grundlagenreiz geht verloren. Aerobe Effizienz ist die Hauptbaustelle und am besten trainierbar."},
 {cat:"Training",text:"Z2 heißt Z2: bis Retest nach Puls 128–158 (Watt eher 110–150). Nasenatmung bzw. Sprechen muss möglich sein."},
 {cat:"Training",text:"Lange Ausfahrten: 60–80 g KH/h ab Stunde 1, 500–750 ml/h trinken. Kette frisch gewachst vor jedem Rennen."},
 {cat:"Material",text:"Spacer ab sofort schrittweise raus: 5 mm alle 2–3 Wochen, Nacken/Rücken beobachten — gratis Aero-Gewinn Nr. 1."},
 {cat:"Material",text:"50-mm-Frontreifen am 18.7. testen, Tire Inserts + Race-Sealant bis 25.7. montieren (Race-Setup-Fahrt). Kette frisch gewachst vor jedem Rennen."},
 {cat:"Bedienung",text:"Woche antippen = auf-/zuklappen · Tag antippen = Einheits-Details · Häkchen und Notizen werden lokal auf dem Gerät gespeichert."}
];

const CHANGELOG=[
 {date:"05.07.2026",text:"Sonntags-Abgleich W4: 5 Radtage, Rad-Ist 7,6 h (Soll 7,25), Kraft 1/1 — stärkste Basiswoche, komplett regelkonform. Wochenanalyse geschrieben. Form erholt sich (−15 → −4). 1-h-Power-Durchbruch auf 186 W."},
 {date:"04.07.2026",text:"Strava-Abgleich: Fr 3.7. Feierabend-Z2+Sprints (77′, neue Sattelposition ~2 cm vor) und Sa 4.7. Lambi–Weinbiet (3,3 h, 875 hm). NEUE BESTWERTE: 1-h 186 W, 20-min 211 W. Form −15 (kräftiger Reiz). W4 fast komplett."},
 {date:"01.07.2026",text:"Zwei neue Features: (1) Daten-Backup im Setup — alle lokalen Daten als JSON sichern/wiederherstellen. (2) Z2-Effizienz-Kurve im Fortschritt — Watt je Herzschlag (×100) pro Z2-Einheit, Indoor/Outdoor getrennt. Kernmetrik bis zur Traka. Indoor-Trend: 100 → 101 → 103."},
 {date:"01.07.2026",text:"Navigation gestrafft: Regeln- und Changelog-Reiter zum gemeinsamen Reiter „Logbuch“ zusammengelegt — Regeln oben, darunter die Änderungshistorie. Navigation jetzt 5 Reiter."},
 {date:"01.07.2026",text:"Strava-Abgleich: Mi 1.7. Z2 Zwift (75 min) vormittags vor Nachtdienst — mustergültig (Ø144 bpm, 1-h 155 W). Regelkonform. Form +5."},
 {date:"30.06.2026",text:"Strava-Abgleich: Di 30.6. Krafttraining (82 min) als W4-Kraft eingetragen. Form +10. W4 planmäßig."},
 {date:"30.06.2026",text:"August-Soll gegengecheckt: Urlaubswoche W12 hatte paradoxerweise das höchste Soll (8h). Korrigiert auf ~4h Grund-Soll, Sylt-Einheiten Di/Do/Fr optional. W11-Anreisetag-Ausfahrt optional. August-Verlauf: W9 7,5h → W10 6,3h → W11 4,5h → W12 4h."},
 {date:"30.06.2026",text:"Regeln-Reiter ergänzt: alle festen Regeln nach Bereich gruppiert zum klaren Durchsehen."},
 {date:"30.06.2026",text:"Neue Regel: mindestens 1 echter Ruhetag pro Woche (fest, nicht optional). W9 hatte als einzige Woche keinen — Fr 7.8. ist jetzt Ruhetag (vor der langen Sa-Ausfahrt, für frische Beine). Alle 12 Wochen erfüllen die Regel."},
 {date:"30.06.2026",text:"Dienst-Regeln überarbeitet für eindeutiges Kalender-Lesen: Leitregel mit Schritt-für-Schritt-Algorithmus (mehrtägiger Balken = Nachtdienst mit Post-Call am letzten Tag; eintägiger Balken = Tagdienst; KEIN Balken = normaler Arbeits-/Freitag) + Konsequenz-Regel pro Tagtyp. Verhindert künftige Lesefehler beim Dienstplan-Update."},
 {date:"30.06.2026",text:"Kompletter Juli + August gegen den Dienstplan und alle Regeln geprüft: Nachtdienste lösen jetzt überall Post-Call-Ruhetage aus (W4 Do 2., W5 Do 9., W7 So 26., W8 Fr 31., W10 So 16.). Lange Ausfahrten an Dienst-Wochenenden ersatzlos gestrichen (W7 Sa 25., W10 Sa 15.) — bei Nachtdienst am WE nicht planbar, kein Nachholen. Normale Arbeitstage korrekt als solche markiert (Fr 3., Fr 10.). Sylt-Anreise auf Sa 22. korrigiert (keine Fahrt am Reisetag)."},
 {date:"30.06.2026",text:"Dienstplan Juli+August eingearbeitet. W5 Dienst Mi–Fr korrigiert, W7 Dienst ab Sa 25. August neu (W9–W12): W9 Basis, W10 erste Schwellen-/Sweet-Spot-Woche (Phase-2-Einstieg), W11 Übergang + Sylt-Anreise, W12 Sylt-Urlaub (Basis, flexibel). Mikroplan reicht bis Ende August."},
 {date:"29.06.2026",text:"W4 gestartet: Mo Z2+Sprints outdoor (103 min, Ø145 bpm, 5s-Spitze 820 W). Setup erweitert: Wahoo ELEMNT ACE, TRACKR Heart Rate, TRACKR Radar. Notiz für Phase 4: Normalized Power für lange/variable Fahrten ergänzen. Form +6."},
 {date:"28.06.2026",text:"Sonntags-Abgleich W3: alle 5 Einheiten erfasst. Fr/Sa-Tausch sauber modelliert (Z2 lief Fr, Kraft Sa — beide Soll-Positionen erfüllt), Do-Z2 entfiel. Verteilung wetter-/dienstbedingt. Wochenanalyse geschrieben. Form wieder +12. FTP 205 W durch Lambi-Dauerwerte bestätigt."},
 {date:"24.06.2026",text:"Neue feste Regel (Dienste): Bei Spätdienst-Unsicherheit die sichere Einheit am freien Vormittag mitnehmen, auch außerhalb des Rasters — eine garantierte Einheit schlägt mehrere geplante, die der Dienst auffrisst. Mehrleistung als Bonus. Bildet ab, wie die Lambi-Tour zustande kam."},
 {date:"24.06.2026",text:"Strava-Abgleich: Mi 24. große Ausfahrt „Lambi alternativ“ (146 min, 57 km, 515 hm) statt Ruhetag → Bonus (ins Ist, nicht ins Soll), Tag als Rad markiert. Erste Dauerleistung nach Retest: 20-min 207 W, 1-h 172 W → bestätigt Planungs-FTP 205 W. Form -9 (Ermüdung). Entlastungswoche: Rest bewusst locker."},
 {date:"23.06.2026",text:"Strava-Abgleich W3: Mo 22. Kraft (65 min) und Di 23. FTP-Ramp-Test (54 min, 32°C indoor) eingetragen. Test bestätigt das Profil: 5s 335 W / 1-min 320 W, Ramp-FTP 242 W. Form nach Test +13 (weiter frisch). Planungs-FTP bleibt 205 W."},
 {date:"23.06.2026",text:"FTP-Retest (Zwift Ramp-Test am Kickr, frisch bei Form +22): 242 W. Für Planung & Zonen konservativ auf 205 W gesetzt — Ramp überschätzt bei Sprint-Profil die Schwelle, Dauerleistung (1-h 179 W) stützt den niedrigeren Wert. Alle Wattzonen neu (Z2 115–154 W). In Zwift bleiben 242 W."},
 {date:"21.06.2026",text:"Sonntags-Abgleich W2 abgeschlossen: alle 4 Einheiten erfasst, Fr–So Pause. Wochenanalyse W2 geschrieben. Form-Kurve auf +22 (frisch) — optimal getimt vor dem FTP-Retest am Di 23.6."},
 {date:"18.06.2026",text:"Bonus-Einheiten zählen jetzt ins Rad-Ist (nicht ins Soll) — die heutige Zusatz-Ausfahrt erscheint in der Ist-Radzeit. Zusätzlich farbkodierte Abweichungs-Markierung: Mi 17. (geplant Ruhe → Kraft gemacht) und Do 18. (geplant Kraft → Rad gefahren) zeigen die tatsächliche Einheit als Farbe + Hinweis."},
 {date:"18.06.2026",text:"Korrektur W2: Do-Kraft wurde auf Mi 17. vorgezogen → zählt als erfüllte Kraft (1/1), kein zusätzliches Soll. Die heutige ruhige Rad-Ausfahrt (84 min) ist eine Zusatzeinheit → als Bonus erfasst, nicht im Rad-Soll. W2: Rad 3,4 h (124%), Kraft 1/1, +1,4 h Bonus."},
 {date:"18.06.2026",text:"Strava-Abgleich: Do 18.6. „Ruhig vor dem Dienst“ 84 min Outdoor (Ø155 bpm, 129 W) statt der geplanten Kraft-Einheit eingetragen. Auffällig: Puls relativ hoch bei moderaten Watt — Outdoor-typisch (Wind, Rollwiderstand, Hitze) vs. Zwift."},
 {date:"17.06.2026",text:"Neue Fitness-/Form-Kurve im Fortschritt-Reiter (vereinfachtes PMC nach TrainingPeaks-Vorbild): Fitness (42-Tage-Trend), Ermüdung (7-Tage), Form (Differenz). Zeigt, ob du aufbaust ohne zu überlasten und ob du frisch ins Rennen gehst. Basis: Strava Relative Effort (FTP-unabhängig). Aktuell Form +6 — gut erholt nach dem Dolomiten-Block."},
 {date:"17.06.2026",text:"RPE-Abgleich verfeinert: Lange Gravel-Ausfahrten haben keinen Erwartungswert mehr — ihre Anstrengung ist zu routenabhängig (flach vs. viele Höhenmeter vs. Race-Sim). RPE lässt sich weiter notieren, aber ohne Soll-Ist-Hinweis. Strukturierte Einheiten (Z2, Sweet Spot, Schwelle) behalten den Abgleich."},
 {date:"17.06.2026",text:"Zwei neue Features nach Join-Cycling-Analyse: (1) RPE-Soll-Ist-Abgleich — jede Einheit hat eine erwartete RPE (Z2 3–4, SS 5–6, Schwelle 7–8, lange Gravel 4–5, Sprints 4–6); liegt die notierte deutlich darüber, erscheint ein Hinweis (Ermüdung oder FTP zu hoch). (2) Readiness-Check in der Übersicht (Fit/Okay/Platt) — empfiehlt je nach Status, wie die nächste Einheit anzugehen ist. Beide nur empfehlend, Post-Call bleibt immer Ruhetag."},
 {date:"16.06.2026",text:"Übersicht: Traka-Countdown jetzt ganz oben. Indoor-Setup (Zwift Ride Frame + Kickr Core + Zwift-Abo) als vorhanden markiert."},
 {date:"16.06.2026",text:"Zwei neue Reiter: „Fortschritt“ (Gesamtbilanz, FTP-Kurve, Wochenumfang, Kraftverlauf, alle Wochenanalysen) und „Changelog“ (Änderungshistorie). Aus dem Plan herausgelöst. Navigation jetzt 5 Reiter."},
 {date:"16.06.2026",text:"Strava-Abgleich W2: Mo 15.6. Z2+Sprints 87 min (Ø152 bpm, 135 W), Di 16.6. Zwift-Mitteldistanz 117 min (Ø139 bpm, 1-h-Power 146 W) — sehr kontrolliert aerob. Beide erfüllt, W2 bei 124%."},
 {date:"15.06.2026",text:"Design-Überarbeitung (v25): neue „Forest“-Palette (tiefes Tannengrün, getöntes Bone, Burnt-Orange-Akzent) statt Beige-Grau, getönte weiche Schatten statt flacher Rahmen, einheitlicher 14px-Radius, feinere Typo-Hierarchie (Header-Akzentlinie, Eyebrow-Strich), Pills mit Rand, Legende-Items als Panel-Pillen, sanfte Hover-/Tactile-States, Verläufe und Glow auf den Fortschrittsbalken. Layout und Funktion unverändert. Dark Mode mitgezogen."},
 {date:"14.06.2026",text:"Plan-Überarbeitung nach Strava-Komplettanalyse (5 Punkte): (1) FTP-Korrektur 226→~190 W als Priorität, (2) Sprints in Phase 1 nur jede zweite Woche, (3) Kraft-Reduktions-Leitlinie über die Phasen, (4) zweite Werktags-Mitteldistanz (90–120′) ausgebaut, (5) Laufen als Ausweich-Option. Ziel: aerobe Basis gezielt stärken."},
 {date:"14.06.2026",text:"Soll-Berechnung: Bei Einheiten mit Zeitspanne zählt jetzt das Minimum als Soll (z. B. \"2,5–3 h\" → Soll 2,5 h). Betrifft W1 Sa, W4 Mo+Sa, W5 So, W7 So."},
 {date:"14.06.2026",text:"Legende repariert: Farbpunkte waren unsichtbar (CSS-Farbvariablen fehlten) — jetzt definiert (hell+dunkel), alle Farben im Dashboard sichtbar. Legende mit Titel und klar getrennten Items inkl. Zusatz/Bonus."},
 {date:"14.06.2026",text:"Header zeigt Gesamtbilanz über alle 8 Wochen. Pro Woche eigene Ist/Soll-Prozentleiste, auch zugeklappt."},
 {date:"14.06.2026",text:"Optionale Einheiten (opt): zählen nicht ins Soll, aber ins Ist. So 14.6. optional → W1-Rad-Soll korrekt."},
 {date:"14.06.2026",text:"Soll/Ist-Balken: 100 % = Soll (grün), Mehrleistung als orange Überschreitung. Rad, Kraft, Bonus getrennt."},
 {date:"14.06.2026",text:"v14: W1 auf volle Woche Mo 8.–So 14.6. erweitert und vollständig mit echten Strava-Werten gefüllt (Mo+Di Kraft, Mi Bonus-Lauf, Sa Z2 123 min, So Aubachtal 111 min). Einheiten mit Strava-Ist-Daten gelten automatisch als erledigt (kein Häkchen nötig). W1-Bilanz: 2/2 Rad ~4,8 h · 3/3 Kraft."},
 {date:"14.06.2026",text:"v11: Krafttraining wird jetzt separat geführt (eigener Wochen- und Gesamtzähler 🏋, fließt nicht in die Rad-Stunden). Neuer Bereich „Fortschritt & Kurven“: FTP-Entwicklung (20-min- und 1-h-Power aus Strava, mit Ziel-Linie 226 W) und Rad-Wochenumfang (Plan vs. Ist). Datenpunkte werden beim Sonntags-Abgleich gepflegt."},
 {date:"14.06.2026",text:"W2 angepasst: Fortbildung jetzt Sa+So (statt Fr/Sa) → lange Gravel-Ausfahrt So 21.6. entfällt ersatzlos (Regel: streichen, nicht nachholen). Di 16.6. dafür auf Z2 75′ aufgewertet, um etwas Grundlagenumfang aufzufangen. Wochenumfang dadurch reduziert — passt als ruhigere Woche vor der Entlastungswoche W3."},
 {date:"14.06.2026",text:"Athletenprofil bestätigt: kräftige Beine, aerobe Baustelle. Power-Profil 14.6. — 5s 702 W / 1min 315 W (stark), aber 20min 199 W / 1h 147 W (Dauerleistung schwächer). Konsequenz: Z2 STRIKT nach Puls (128–158) steuern, nicht nach Watt; FTP-Retest konservativ ansetzen, 1-h-Wert ist die ehrliche Traka-Planungsgröße."},
 {date:"14.06.2026",text:"W1 erledigt: Sa 13.6. lange Z2-Ausfahrt 2:03 h (Puls Ø 119 — sauber ruhig) ✓. So 14.6. statt Kraft die Aubachtal-Trailrunde 1:51 h / 456 hm / Puls Ø 159 (Tempo/Z3, RPE ~7) — Krafttag getauscht, dafür diese Woche 3× Kraft absolviert. Kraftblock sitzt."},
 {date:"12.06.2026",text:"v8: Design-Überarbeitung — Dark Mode (folgt Systemeinstellung), Tagesband pro Woche im zugeklappten Zustand (Typ + Erledigt-Status aller 7 Tage auf einen Blick), größere Touch-Ziele, konsistentes Form- und Typo-System, sanfteres Bewegungsverhalten."},
 {date:"12.06.2026",text:"v7: Notizfeld pro Einheit (RPE 1–10 + Stichwort, lokal gespeichert). Material-Tests eingeplant: 50-mm-Front Sa 18.7., Inserts + Race-Sealant bis Sa 25.7., Spacer-Reduktion als laufende Regel. Strava-Wochenabgleich als Ritual gestartet."},
 {date:"12.06.2026",text:"Strava-Analyse Sella Ronda (6.6.): 20-min-Best 197 W, 1-h-Best 179 W → reale FTP ~190–200 W, hinterlegte 226 W zu hoch. Bis zum Retest am 23.6.: Z2 nach PULS fahren (128–158), Watt eher 110–150 W statt 125–170 W."},
 {date:"12.06.2026",text:"Herbstrennen-Kandidaten: Gravel-Event Bühlertal So 4.10. (55/86/120 km — Empfehlung: 86 km/1.800 hm, ~1 h Anfahrt) · Schwarzwald Bike Marathon Gravel Furtwangen So 13.9. (46 km/700 hm, Zeitmessung, Anmeldung offen) · Niederrhein Gravel Sa 3.10. (110/160 km flach). Entscheidung nach September-Dienstplan."},
 {date:"11.06.2026",text:"v6: Eigenständige Web-App (PWA) — offline-fähig, Daten lokal auf dem iPhone, unabhängig von Claude."},
 {date:"11.06.2026",text:"v5: Regeln-Reiter eingeführt (alle Dienst- und Trainingsregeln gesammelt), Header und Fußbereich entschlackt."},
 {date:"11.06.2026",text:"Dienst 12.→13.7. gestrichen: So 12.7. jetzt Recovery-Spin Z2 60–75′, Mo 13.7. regulärer Ruhetag. W5/W6 damit am Wochenende dienstfrei."},
 {date:"11.06.2026",text:"Bestätigt: Vor Nachtdiensten ist der Vormittag frei → Vormittagseinheiten 16.6., 18.6., 1.7., 8.7. fest; Fr 31.7. neu mit Z2 45–60′ locker statt Ruhe."},
 {date:"11.06.2026",text:"Dienstplan-Korrekturen: So 5.7. = Tagdienst (1 blockierter Wochenendtag = Tagdienst) → Ruhetag, lange Ausfahrt Sa 4.7. · Mo 29.6. frei → Z2 105–120′ + Sprints · Fortbildung 19./20.6. → Ruhe · BMW Mo 15.6. → Einheit ab ~17:30."},
 {date:"11.06.2026",text:"Dashboard v3: Einheits-Details, Wochenvolumen-Chart, Zonentabelle, Traka-Countdown. Zwift-Workouts Jan 1–7 (.zwo, FTP-relativ) erstellt."},
 {date:"11.06.2026",text:"Plan erstellt: Mikroplan W1–W8 (12.06.–02.08.), FTP-Retest Di 23.06., Volumenwoche W7, Entlastung W3 + W8. Offen: August-Dienstplan, Herbstrennen."}
];

const ZONES=[["Z1 Regeneration","< 113 W","< 128"],["Z2 Grundlage","115–154 W","128–158"],["Z3 Tempo","156–185 W","159–174"],["Sweet Spot","180–193 W","165–175"],["Z4 Schwelle","187–215 W","175–189"],["Z5 VO2max","217–246 W","190+"]];

const FTP_LOG=[
 {date:"06.06",label:"Sella Ronda",p20:197,p60:179},
 {date:"14.06",label:"Aubachtal",p20:199,p60:147},
 {date:"23.06",label:"Ramp-Test",p20:242,p60:205},
 {date:"24.06",label:"Lambi (5h-Tour)",p20:207,p60:172},
 {date:"04.07",label:"Lambi–Weinbiet",p20:211,p60:186},
];
// Fitness/Ermüdung/Form (PMC) aus Strava Relative Effort. Fit=42-Tage, Müd=7-Tage, Form=Fit−Müd.
const PMC_LOG=[
 {date:"24.05",fit:2,mued:2,form:1},
 {date:"31.05",fit:28,mued:65,form:-37},
 {date:"07.06",fit:52,mued:102,form:-51},
 {date:"14.06",fit:46,mued:45,form:0},
 {date:"17.06",fit:44,mued:39,form:6},
 {date:"21.06",fit:38,mued:16,form:22},
 {date:"23.06",fit:38,mued:25,form:13},
 {date:"24.06",fit:42,mued:51,form:-9},
 {date:"28.06",fit:37,mued:25,form:12},
 {date:"29.06",fit:38,mued:31,form:6},
 {date:"30.06",fit:37,mued:27,form:10},
 {date:"01.07",fit:38,mued:32,form:5},
 {date:"02.07",fit:36,mued:24,form:12},
 {date:"03.07",fit:37,mued:29,form:7},
 {date:"04.07",fit:41,mued:57,form:-15},
 {date:"05.07",fit:39,mued:43,form:-4},
];
// Wöchentliche Rad-Stunden Ist (aus Strava). Wird beim Abgleich ergänzt.
const RIDE_LOG=[
 {wk:"W1",h:3.9},
 // W2 ff. folgen
];


const ACTUAL = {
  "W1-0": { min: 82, sport: "WeightTraining", note: "Krafttraining" },
  "W1-1": { min: 85, sport: "WeightTraining", note: "Krafttraining" },
  "W1-2": { min: 71, sport: "WeightTraining", note: "Krafttraining" },
  "W1-5": { min: 123, hr: 119, w: 88, km: 41, hm: 207, sport: "Ride", note: "Z1–Z2, sauber ruhig" },
  "W1-6": { min: 111, hr: 159, w: 166, km: 42, hm: 456, sport: "Ride", note: "Aubachtal-Trail statt Kraft, RPE ~7" },
  "W2-0": { min: 87, hr: 152, w: 135, km: 36, hm: 81, sport: "Ride", note: "Z2 + Sprints, viel Gegenwind" },
  "W2-1": { min: 117, hr: 139, w: 139, km: 43, hm: 578, sport: "VirtualRide", note: "Zwift Z2 Mitteldistanz — kontrolliert aerob" },
  "W3-0": { min: 65, sport: "WeightTraining", note: "Krafttraining am Morgen (Spätdienstwoche)" },
  "W3-1": { min: 54, hr: 144, w: 122, km: 20, hm: 157, sport: "VirtualRide", note: "FTP-Ramp-Test (242 W) + lockeres Ausrollen, 32°C indoor — 1-min-Spitze 320 W, 5s 335 W" },
  "W3-2": { min: 146, hr: 161, w: 152, km: 57, hm: 515, sport: "Ride", note: "Lambi alternativ (Bonus) — 20-min 207 W, 1-h 172 W nach Retest" },
  "W3-4": { min: 55, sport: "WeightTraining", note: "Kraft (Fr/Sa-Tausch — erfüllt Kraft-Soll)" },
  "W3-5": { min: 61, hr: 140, w: 142, km: 28, hm: 196, sport: "VirtualRide", note: "Z2 + 4×15s-Sprints, 35°C indoor — mustergültig kontrolliert (max 160 bpm), Sprints bis 512 W. Lief real Fr, erfüllt Sa-Z2-Soll." },
  "W4-0": { min: 103, hr: 145, w: 135, km: 44, hm: 166, sport: "Ride", note: "Z2 + paar Sprints, outdoor — kontrolliert aerob (Ø145 bpm), 5s-Spitze 820 W" },
  "W4-1": { min: 82, sport: "WeightTraining", note: "Krafttraining am Nachmittag" },
  "W4-2": { min: 75, hr: 144, w: 148, km: 40, hm: 59, sport: "VirtualRide", note: "Z2 Zwift vormittags vor Nachtdienst — sehr kontrolliert (Ø144 bpm, max 159), 1-h 155 W" },
  "W4-4": { min: 77, hr: 149, w: 141, km: 34, hm: 127, sport: "Ride", note: "Feierabend-Z2 + Sprints (5s 736 W) — neue Sattelposition, ~2 cm weiter vorn. Puls oberes Z2 (Ø149)." },
  "W4-5": { min: 198, hr: 153, w: 151, km: 69, hm: 875, sport: "Ride", note: "Lambi–Weinbiet: 875 hm, Anstiege ~210 W bei Puls 165–173. NEUE BESTWERTE: 1-h 186 W (vorher 172), 20-min 211 W." },
  "W2-3": { min: 56, sport: "WeightTraining", note: "Kraft auf Mi 17. vorgezogen, dort erledigt" },
};
const REVIEWS = [
  { wk: "W1", radH: "3,9 h (Soll ~3 h)", lang: true, z2: "sauber (Sa Ø119 bpm, max 158)", kraft: "3/3", bonus: "Lauf 36′ / 5,1 km",
    fazit: "Sehr solider Auftakt, mehr Volumen als geplant: 3× Kraft (82/85/71 min) + Lauf-Bonus + 2 Radtage, gesamt ~8,5 h. Samstag mustergültig ruhig (Z1–Z2, Ø119 bpm). Sonntag Aubachtal-Trail bewusst härter (Ø159 bpm, Z3, RPE ~7). Power-Profil bestätigt das Bild: kräftige Beine (5s 678 W), aerobe Dauerleistung noch die Baustelle (1h 94–147 W).",
    ableitung: "W2 ruhig angehen, Z2 strikt nach Puls (128–158). Fortbildung Sa+So streicht die lange Ausfahrt — bewusst keine Kompensation, W2 als leichtere Woche vor dem FTP-Retest (Di 23.6.) nehmen." },
  { wk: "W2", radH: "4,8 h Ist (Soll 2,75 h · inkl. Bonus)", lang: false, z2: "sehr kontrolliert (Di Zwift Ø139 bpm bei 139 W)", kraft: "1/1", bonus: "Rad 84′ / 35 km (Do)",
    fazit: "Trotz reduzierter Planwoche viel aerobe Qualität: Mo Z2+Sprints (87′, Ø152 bpm, Gegenwind), Di Zwift-Mitteldistanz (117′, sehr ruhig Ø139 bpm — die beste Z2-Kontrolle bisher). Do-Kraft auf Mi vorgezogen (Post-Call abends, 56′), am freien Do-Vormittag spontan eine ruhige Ausfahrt als Bonus (84′). Fr–So Fortbildung = komplett Pause, wie vorgesehen. Form-Kurve klettert auf +22 (frisch).",
    ableitung: "Optimal getimt: Die ruhige Wochenmitte + Wochenend-Pause bringt dich frisch zum FTP-Retest am Di 23.6. Den Retest am Kickr fahren (wegen der Watt-Diskrepanz indoor/outdoor) und das Gerät notieren. Danach Zonen + FTP-Kurve aktualisieren. Auffällig fürs Protokoll: Watt-Puls-Verhältnis outdoor schlechter als auf Zwift — Powermeter-Kalibrierung beider Geräte steht an." },
  { wk: "W3", radH: "4,4 h Ist (Soll 3,75 h · inkl. Bonus)", lang: false, z2: "mustergültig (Fr Ø140 bpm, max 160, 4 saubere Sprints)", kraft: "2/2", bonus: "Lambi-Tour 146′ / 57 km / 515 hm",
    fazit: "Spätdienst-/Entlastungswoche, vom Wetter und Dienst stark geprägt — Verteilung war so nicht frei wählbar. Mo Kraft, Di FTP-Retest (242 W), Mi spontane große Lambi-Tour (Chance ergriffen, da Spätdienst-Folgetage unsicher), Fr/Sa Z2 und Kraft getauscht, Do-Z2 entfiel. Highlight: Die Fr-Z2 mit Sprints war mustergültig aerob kontrolliert (Ø140 bpm). Wichtigster Datenpunkt: erste Dauerleistung nach Retest (Lambi 20-min 207 W, 1-h 172 W) bestätigt Planungs-FTP 205 W eindeutig.",
    ableitung: "FTP-Frage geklärt (205 W stimmt). Form trotz großer Tour wieder bei +12 — gut erholt. W4 (29.6.–5.7.) ist erste reguläre Aufbauwoche: zurück zur strukturierten Z2-Mitteldistanz, lange Ausfahrt am Sa wieder als Soll. Z2 weiter strikt nach Puls (jetzt mit validierter Wattspanne 115–154 als Gegencheck). August-Dienstplan nachreichen." },
 { wk: "W4", radH: "7,6 h Ist (Soll 7,25 h)", lang: true, z2: "durchweg kontrolliert (Mi Ø144, Fr Ø149)", kraft: "1/1", bonus: "—",
    fazit: "Die bisher stärkste Woche der Basisphase — 5 Radtage, alle regelkonform um den Dienstplan gelegt. Mo Z2+Sprints outdoor (103′, 5s 820 W), Di Kraft, Mi Z2 Zwift vormittags vor dem Nachtdienst (mustergültig Ø144), Do Post-Call sauber ausgeruht, Fr Feierabend-Z2 mit neuer Sattelposition (~2 cm vor), Sa die große Lambi–Weinbiet-Tour (69 km, 875 hm). So Tagdienst = Ruhe. Highlight: die Weinbiet-Anstiege konstant ~210 W bei Puls 165–173.",
    ableitung: "Durchbruch bei der aeroben Dauerleistung: 1-h-Power von 172 auf 186 W gesprungen (+8 % in 10 Tagen), 20-min 211 W — die Basis greift sichtbar. Planungs-FTP 205 W bleibt korrekt (eher leicht konservativ). Form −4, gut auf dem Weg zurück. Nächste Woche W5 (6.–12.7.): Nachtdienst Mi 8.→Do 9. (Do Post-Call), sonst normale Aufbauwoche. Neue Sattelposition auf Komfort/Knie beobachten." },
];

const BONUS = [
  { wk: "W1", dayKey: "W1-2", date: "10.06", sport: "Run", min: 36, km: 5.1, note: "Z2-Lauf morgens" },
 { wk: "W2", dayKey: "W2-3", date: "18.06", sport: "Ride", min: 84, km: 35, note: "Ruhig vor dem Dienst (zusätzlich)" },
 { wk: "W3", dayKey: "W3-2", date: "24.06", sport: "Ride", min: 146, km: 57, note: "Lambi alternativ — große Tour, 515 hm" },
];

const BONUS_COLOR = "#1F8A8A";
const TYPE_META = TYPE;
const STORAGE_KEY = "jan-training-progress-v2";
const NOTES_KEY = "jan-training-notes-v2";
const ORDER_KEY = "jan-training-dayorder-v2";
const READINESS_KEY = "jan-training-readiness-v2";
const SETUP_TODOS = [
  { txt: "Spacer schrittweise raus (5–10 mm über Wochen) — gratis, größter Aero-Gewinn", when: "laufend", done: false },
  { txt: "Tire Inserts + Race-Dichtmilch einbauen", when: "bis Sa 25.7.", done: false },
  { txt: "50-mm-Frontreifen testen", when: "Sa 18.7.", done: false },
  { txt: "42–44T Kettenblatt prüfen", when: "optional", done: false },
  { txt: "Komfort-Sattelstütze für Langstrecke", when: "optional", done: false },
  { txt: "FTP-Retest → alle Wattbereiche neu rechnen (242 W Ramp, Plan 205 W)", when: "erledigt", done: true },
  { txt: "Normalized Power für lange/variable Fahrten ergänzen (statt nur Ø-Watt) — sinnvoll für Race-Simulationen & echten TSS. NICHT für ruhige Z2 (da Ø-Watt ehrlicher).", when: "Phase 4 (ab März 2027)", done: false },
 { txt: "Indoor-Setup komplett: Zwift Ride Frame + Kickr Core + Zwift-Abo vorhanden", when: "erledigt", done: true },
];
const SETUP_BIKE = [
  { k: "Rad", v: "Orbea Terra Race M21eLTD 1X" },
  { k: "Antrieb", v: "SRAM Force XPLR AXS 13-fach, 40T, 10–46" },
  { k: "Powermeter", v: "SRAM einseitig" },
  { k: "Laufräder", v: "OQUO RP50LTD (25 mm innen, ~1.460 g)" },
  { k: "Reifen", v: "Schwalbe G-One RS Pro 45 mm" },
  { k: "Cockpit", v: "integriert 100/400, aktuell ~3 Spacer" },
  { k: "Sattelstütze", v: "OC XP10 Carbon, 27,2 mm, ohne Setback" },
  { k: "Sattel", v: "Selle San Marco Shortfit 2.0" },
  { k: "Pedale / Schuhe", v: "Shimano XTR M9200 / Lake MX30G" },
  { k: "Kette", v: "gewachst (Optimize Wax), frisch vor jedem Rennen" },
  { k: "Indoor", v: "Zwift Ride Frame + Wahoo Kickr Core + Zwift-Abo (vorhanden)" },
 { k: "Radcomputer", v: "Wahoo ELEMNT ACE (mit Luftwiderstands-/Windmessung)" },
 { k: "Herzfrequenz", v: "Wahoo TRACKR Heart Rate" },
 { k: "Sicherheit", v: "Wahoo TRACKR Radar (Rückfahr-Radar, warnt vor Fahrzeugen von hinten)" },
];
const RIDE = ["z2", "lang", "intens"];
const isDone = (done, key) => !!done[key] || !!ACTUAL[key];
const expectedRPE = (d) => {
  const t = (d.title + " " + (d.sub || "")).toLowerCase();
  // Kein Abgleich für Ruhe, Kraft und lange Gravel-Ausfahrten (zu routenabhängig)
  if (d.type === "ruhe" || d.type === "kraft" || d.type === "lang") return null;
  if (/lange|gravel/.test(t)) return null;
  if (/sprint/.test(t)) return [4, 6];
  if (/sweet ?spot|\bss\b/.test(t)) return [5, 6];
  if (/schwelle|ftp|test|vo2|intervall/.test(t)) return [7, 8];
  if (d.type === "z2" || /z2|grundlage|mitteldistanz|recovery|locker/.test(t)) return [3, 4];
  return [4, 5];
};
const rpeFlag = (d, nv) => {
  if (!nv || !nv.rpe) return null;
  const exp = expectedRPE(d); if (!exp) return null;
  if (nv.rpe >= exp[1] + 2) return { level: "hoch", exp, got: nv.rpe };
  if (nv.rpe > exp[1]) return { level: "leicht", exp, got: nv.rpe };
  return null;
};

function weekStats(w, done) {
  let rh = 0, rd = 0, rt = 0, kt = 0, kd = 0, rhIst = 0, bonusH = 0;
  w.days.forEach((d, i) => {
    const key = w.id + "-" + i, act = ACTUAL[key], dn = isDone(done, key);
    if (d.type === "kraft") { kt++; if (dn) kd++; return; }
    if (d.type === "ruhe") return;
    if (!d.opt) { rt++; rh += d.h; }
    if (dn) { rd++; rhIst += act ? act.min / 60 : d.h; }
  });
  BONUS.filter((b) => b.wk === w.id).forEach((b) => { bonusH += b.min / 60; });
  rhIst += bonusH;
  return { rhPlan: rh, rd, rt, kt, kd, rhIst, bonusH };
}

// ——— SVG-Graphen (reine SVG, theme-fähig via CSS-Variablen) ———
function LineGraph({ series, ymin, ymax, xlabels, ylabels }) {
  const W = 340, H = 160, pl = 34, pr = 10, pt = 12, pb = 24;
  const iw = W - pl - pr, ih = H - pt - pb, n = xlabels.length;
  const xAt = (i) => pl + (n <= 1 ? iw / 2 : (iw * i) / (n - 1));
  const yAt = (v) => pt + ih - (ih * (v - ymin)) / (ymax - ymin || 1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" role="img">
      {(ylabels || [ymin, (ymin + ymax) / 2, ymax]).map((v, k) => (
        <g key={k}>
          <line x1={pl} y1={yAt(v)} x2={W - pr} y2={yAt(v)} stroke="#D6D3C7" strokeWidth="1" />
          <text x={pl - 5} y={yAt(v) + 3} textAnchor="end" fontSize="9" fill="#5B655C">{Math.round(v)}</text>
        </g>
      ))}
      {xlabels.map((lb, i) => (
        <text key={i} x={xAt(i)} y={H - 7} textAnchor="middle" fontSize="9" fill="#5B655C">{lb}</text>
      ))}
      {series.map((s, si) => (
        <g key={si}>
          {s.pts.length > 1 && (
            <path d={s.pts.map((p, i) => `${i ? "L" : "M"}${xAt(p.x).toFixed(1)},${yAt(p.y).toFixed(1)}`).join(" ")}
              fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          )}
          {s.pts.map((p, i) => (
            <circle key={i} cx={xAt(p.x).toFixed(1)} cy={yAt(p.y).toFixed(1)} r="3.5" fill={s.color} />
          ))}
        </g>
      ))}
    </svg>
  );
}

function BarGraph({ bars, ymax }) {
  const W = 340, H = 150, pl = 30, pr = 8, pt = 10, pb = 22;
  const iw = W - pl - pr, ih = H - pt - pb, n = bars.length, gap = 5;
  const bw = (iw - gap * (n - 1)) / n;
  const yAt = (v) => pt + ih - (ih * v) / (ymax || 1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" role="img">
      {[0, ymax / 2, ymax].map((v, k) => (
        <g key={k}>
          <line x1={pl} y1={yAt(v)} x2={W - pr} y2={yAt(v)} stroke="#D6D3C7" strokeWidth="1" />
          <text x={pl - 5} y={yAt(v) + 3} textAnchor="end" fontSize="9" fill="#5B655C">{Math.round(v)}</text>
        </g>
      ))}
      {bars.map((b, i) => {
        const x = pl + i * (bw + gap), y = yAt(b.val), bh = pt + ih - y;
        return (
          <g key={i}>
            <rect x={x.toFixed(1)} y={y.toFixed(1)} width={bw.toFixed(1)} height={Math.max(0, bh).toFixed(1)}
              rx="2" fill={b.big ? "#D14B1F" : "#3E6F8E"} opacity={b.done ? 1 : 0.4} />
            <text x={(x + bw / 2).toFixed(1)} y={H - 7} textAnchor="middle" fontSize="9" fill="#5B655C">{b.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

const T = {
  bg: "#E6E4DA", panel: "#FBFAF5", panel2: "#EFEDE3", ink: "#1C231C",
  inkSoft: "#586259", inkFaint: "#8A9189", line: "#DAD7CB", accent: "#C8491D",
  accentSoft: "#F4E2D8", done: "#2E5746", dienst: "#7A3E8F",
  shadowCard: "0 1px 3px rgba(46,87,70,.05), 0 6px 24px -8px rgba(28,35,28,.08)",
};

export default function TrainingDashboard() {
  const [done, setDone] = useState({});
  const [notes, setNotes] = useState({});
  const [openWeeks, setOpenWeeks] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    const cur = Object.entries(WEEK_DATES).find(([, [s, e]]) => today >= s && today <= e);
    return cur ? { [cur[0]]: true } : {};
  });
  const [openDay, setOpenDay] = useState(null);
  const [showZones, setShowZones] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [showLog, setShowLog] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [route, setRoute] = useState("overview");
  const [dayOrder, setDayOrder] = useState({});
  const [dragKey, setDragKey] = useState(null);
  const [readiness, setReadiness] = useState({});

  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get(STORAGE_KEY); if (r?.value) setDone(JSON.parse(r.value)); } catch (e) {}
      try { const r = await window.storage.get(NOTES_KEY); if (r?.value) setNotes(JSON.parse(r.value)); } catch (e) {}
      try { const r = await window.storage.get(ORDER_KEY); if (r?.value) setDayOrder(JSON.parse(r.value)); } catch (e) {}
      try { const r = await window.storage.get(READINESS_KEY); if (r?.value) setReadiness(JSON.parse(r.value)); } catch (e) {}
    })();
  }, []);

  const setReady = async (v) => {
    const today = new Date().toISOString().slice(0, 10);
    const next = { ...readiness };
    if (v) next[today] = v; else delete next[today];
    setReadiness(next);
    try { await window.storage.set(READINESS_KEY, JSON.stringify(next)); } catch (e) {}
  };

  // Tage einer Woche in gespeicherter Reihenfolge (mit Original-Index oi)
  const orderedDays = (w) => {
    const order = dayOrder[w.id];
    const base = w.days.map((d, i) => ({ d, oi: i }));
    if (!order || order.length !== base.length) return base;
    const seen = new Set(), out = [];
    order.forEach((oi) => { if (oi >= 0 && oi < base.length && !seen.has(oi)) { out.push(base[oi]); seen.add(oi); } });
    base.forEach((b, i) => { if (!seen.has(i)) out.push(b); });
    return out;
  };
  const moveDay = async (wid, fromOi, toOi, below) => {
    const w = WEEKS.find((x) => x.id === wid); if (!w) return;
    let order = orderedDays(w).map((o) => o.oi);
    order = order.filter((x) => x !== fromOi);
    let idx = order.indexOf(toOi); if (below) idx++;
    order.splice(idx, 0, fromOi);
    const next = { ...dayOrder, [wid]: order };
    setDayOrder(next);
    try { await window.storage.set(ORDER_KEY, JSON.stringify(next)); } catch (e) {}
  };

  const toggle = async (key, ev) => {
    ev.stopPropagation();
    const next = { ...done, [key]: !done[key] };
    setDone(next);
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(next)); } catch (e) {}
  };
  const setNote = async (key, patch) => {
    const cur = notes[key] || {};
    const merged = { ...cur, ...patch };
    if (!merged.n && !merged.rpe) { const n2 = { ...notes }; delete n2[key]; setNotes(n2); try { await window.storage.set(NOTES_KEY, JSON.stringify(n2)); } catch (e) {} return; }
    const next = { ...notes, [key]: merged };
    setNotes(next);
    try { await window.storage.set(NOTES_KEY, JSON.stringify(next)); } catch (e) {}
  };

  const s = useMemo(() => {
    let t = 0, dc = 0, hpPlan = 0, hIst = 0, kt = 0, kd = 0, bonusH = 0;
    WEEKS.forEach((w) => {
      w.days.forEach((d, i) => {
        const key = w.id + "-" + i, dn = isDone(done, key), act = ACTUAL[key];
        if (d.type === "kraft") { kt++; if (dn) kd++; return; }
        if (d.type === "ruhe") return;
        if (!d.opt) { t++; hpPlan += d.h; }
        if (dn) { dc++; hIst += act ? act.min / 60 : d.h; }
      });
      BONUS.filter((b) => b.wk === w.id).forEach((b) => { bonusH += b.min / 60; });
    });
    hIst += bonusH;
    return { t, dc, hpPlan, hIst, kt, kd, bonusH };
  }, [done]);
  const hpct = s.hpPlan ? Math.round((s.hIst / s.hpPlan) * 100) : 0;

  const pct = s.t ? Math.round((s.dc / s.t) * 100) : 0;
  const wTraka = Math.max(0, Math.round((new Date("2027-05-01") - new Date()) / (7 * 864e5)));
  const maxRideH = Math.max(...WEEKS.map((w) => Math.max(weekStats(w, done).rhPlan, weekStats(w, done).rhIst)));
  const today = new Date().toISOString().slice(0, 10);

  // Graph-Daten
  const ftp20 = { pts: FTP_LOG.map((f, i) => ({ x: i, y: f.p20 })), color: "#C2401C" };
  const ftp60 = { pts: FTP_LOG.map((f, i) => ({ x: i, y: f.p60 })), color: "#3E6F8E" };
  const allFtp = FTP_LOG.flatMap((f) => [f.p20, f.p60]);
  const fmin = Math.min(...allFtp, 140) - 10, fmax = Math.max(...allFtp, 210) + 10;
  const bars = WEEKS.map((w) => {
    const wv = weekStats(w, done);
    const hasIst = wv.rhIst > 0;
    return { label: w.id, val: hasIst ? wv.rhIst : wv.rhPlan, done: hasIst, big: w.tag === "Volumen" };
  });
  const maxBar = Math.max(...bars.map((b) => b.val), 1) * 1.1;

  const cap = "font-family:cond";
  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.ink, fontFamily: "'Barlow',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&display=swap');
        :root{--lang:#2E5746;--z2:#3E6F8E;--kraft:#8A7141;--intens:#C2401C;--ruhe:#A8ADA6;--bonus:#1F8A8A;--dienst:#7A3E8F;--done:#2E5746;--accent:#C8491D;}
        @media (prefers-color-scheme: dark){:root{--lang:#5E9C82;--z2:#6FA3C4;--kraft:#C0A36E;--intens:#F0703A;--ruhe:#5C645D;--bonus:#4FC4C4;--dienst:#B07CC4;--done:#5E9C82;--accent:#F0703A;}}
        .cond{font-family:'Barlow Condensed',sans-serif}
        .num{font-variant-numeric:tabular-nums}
        .wk{transition:background .15s ease}
        .wk:hover{background:#EFEDE3}`}</style>

      {/* Kopf */}
      <header style={{ background: "linear-gradient(165deg,#243024 0%,#1A211B 60%,#171E18 100%)", color: "#EFEDE3", padding: "22px 18px 18px", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2, background: "linear-gradient(90deg,var(--accent),transparent 60%)" }} />
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <div className="cond" style={{ fontWeight: 600, letterSpacing: "0.2em", fontSize: 11, color: T.accent, textTransform: "uppercase" }}>
            Phase 1 · Basis · ~{wTraka} Wochen bis The Traka
          </div>
          <h1 className="cond" style={{ fontWeight: 700, fontSize: 34, margin: "4px 0 0", lineHeight: 0.95, textTransform: "uppercase" }}>Jans Trainingscockpit</h1>
          <nav style={{ display: "flex", gap: 4, marginTop: 16, background: "rgba(255,255,255,.07)", padding: 4, borderRadius: 12 }}>
            {[["overview", "Übersicht"], ["plan", "Plan"], ["progress", "Fortschritt"], ["setup", "Setup"], ["logbook", "Logbuch"]].map(([k, l]) => (
              <button key={k} onClick={() => { setRoute(k); setOpenDay(null); }} className="cond" style={{ flex: 1, fontWeight: 600, fontSize: 12.5, letterSpacing: "0.02em", textTransform: "uppercase", color: route === k ? "#fff" : "#A9B0A4", background: route === k ? T.accent : "transparent", border: "none", padding: "9px 5px", borderRadius: 9, cursor: "pointer", minHeight: 40 }}>{l}</button>
            ))}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 920, margin: "0 auto", padding: "14px 14px 44px" }}>
        {route === "overview" && (
          <>
            {/* 1) Countdown (ganz oben) */}
            <div style={{ background: "linear-gradient(135deg,#243024,#1A211B)", color: "#EFEDE3", borderRadius: 14, marginBottom: 10, padding: 16, boxShadow: T.shadowCard }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div className="cond" style={{ fontWeight: 700, fontSize: 52, lineHeight: 0.9, color: T.accent }}>{wTraka}</div>
                  <div className="cond" style={{ fontWeight: 600, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A9B0A4", marginTop: 2 }}>Wochen bis The Traka</div>
                </div>
                <div className="num" style={{ textAlign: "right", fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>{Math.max(0, Math.round((new Date("2027-05-01") - new Date()) / 864e5))} Tage<br /><span style={{ fontSize: 11, color: "#A9B0A4", fontWeight: 500 }}>Mai 2027 · Girona</span></div>
              </div>
            </div>
            {/* 2) Readiness-Check */}
            {(() => {
              const today = new Date().toISOString().slice(0, 10);
              const cwR = WEEKS.find((w) => { const [a, b] = WEEK_DATES[w.id]; return today >= a && today <= b; }) || WEEKS[0];
              let nextR = null;
              for (const { d, oi } of orderedDays(cwR)) { const k = cwR.id + "-" + oi; if (d.type !== "ruhe" && !isDone(done, k)) { nextR = { d, k }; break; } }
              const rToday = readiness[today];
              const isPostCall = nextR && /post-call|nachtdienst/i.test((nextR.d.shift || "") + (nextR.d.sub || ""));
              const exp = nextR ? expectedRPE(nextR.d) : null;
              const hard = exp && exp[1] >= 6;
              let banner = null, bg = "", bc = "";
              if (rToday === "platt") { bg = T.accentSoft; bc = T.accent; banner = <span>⚠ <strong>Reduziert drauf.</strong> {nextR ? (hard ? `Heute steht „${nextR.d.title}“ an — Empfehlung: Intensität rausnehmen (ruhiges Z2 statt Intervalle) oder zum Ruhetag machen.` : `Heute „${nextR.d.title}“ — wenn überhaupt, ganz unten in der Z2-Spanne bleiben (Puls < 145). Kürzer ist okay.`) : "Heute steht nichts Hartes an — ein Ruhetag ist legitim."}</span>; }
              else if (rToday === "okay") { bg = "rgba(138,113,65,.10)"; bc = "#8A7141"; banner = <span>ℹ <strong>Solide, nicht spritzig.</strong> {nextR ? `Für „${nextR.d.title}“: am unteren Ende der Spanne fahren, Umfang wie geplant.` : "Lockerer Tag — passt."}</span>; }
              else if (rToday === "fit") { bg = "rgba(46,87,70,.08)"; bc = T.done; banner = <span>✓ <strong>Gut drauf.</strong> {nextR ? `„${nextR.d.title}“ wie geplant durchziehen.` : "Plan wie vorgesehen."}</span>; }
              const opts = [["fit", "😀 Fit", T.done], ["okay", "😐 Okay", "#8A7141"], ["platt", "😵 Platt", T.accent]];
              return (
                <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14, marginBottom: 10, boxShadow: T.shadowCard, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span className="cond" style={{ fontWeight: 600, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: T.accent }}>Wie fühlst du dich heute?</span>
                    {rToday && <button onClick={() => setReady("")} style={{ fontSize: 11, color: T.inkSoft, background: "transparent", border: "none", textDecoration: "underline", cursor: "pointer" }}>zurücksetzen</button>}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {opts.map(([v, l, c]) => (
                      <button key={v} onClick={() => setReady(v)} className="cond" style={{ flex: 1, fontWeight: 600, fontSize: 15, padding: "12px 6px", borderRadius: 9, border: `1px solid ${rToday === v ? c : T.line}`, background: rToday === v ? c : T.panel, color: rToday === v ? "#fff" : T.ink, cursor: "pointer", minHeight: 48 }}>{l}</button>
                    ))}
                  </div>
                  {banner && <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: 9, fontSize: 12.5, lineHeight: 1.5, background: bg, borderLeft: `3px solid ${bc}`, color: T.ink }}>{banner}</div>}
                  {isPostCall && <div style={{ marginTop: 8, fontSize: 11.5, color: T.inkSoft, fontStyle: "italic" }}>Hinweis: Post-Call-Tag — bleibt Ruhetag, unabhängig vom Status.</div>}
                </div>
              );
            })()}
            {/* 3) Aktuelle Woche */}
            {(() => {
              const cw = WEEKS.find((w) => { const [a, b] = WEEK_DATES[w.id]; return today >= a && today <= b; }) || WEEKS[0];
              const cwS = weekStats(cw, done);
              const cwPct = cwS.rhPlan ? Math.round((cwS.rhIst / cwS.rhPlan) * 100) : 0;
              let next = null;
              for (const { d, oi } of orderedDays(cw)) { const k = cw.id + "-" + oi; if (d.type !== "ruhe" && !isDone(done, k)) { next = { d, k }; break; } }
              return (
                <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14, marginBottom: 10, boxShadow: T.shadowCard, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <span className="cond" style={{ fontWeight: 600, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: T.accent }}>Aktuelle Woche</span>
                    <span className="cond" style={{ fontWeight: 600, fontSize: 15, color: T.ink }}>{cw.id} · {cw.range}</span>
                  </div>
                  <div className="cond num" style={{ fontWeight: 700, fontSize: 34, lineHeight: 1, color: T.ink, marginBottom: 10 }}>{cwS.rhIst > 0 ? cwS.rhIst.toFixed(1).replace(".0", "") : "0"}<span style={{ fontSize: 16, color: T.inkSoft, fontWeight: 600 }}> / {cwS.rhPlan.toFixed(1).replace(".0", "")} h Rad</span> <span style={{ fontSize: 18, color: cwPct >= 100 ? T.accent : T.inkSoft, fontWeight: 700 }}>{cwPct}%</span></div>
                  <div style={{ height: 6, background: "rgba(0,0,0,.06)", borderRadius: 99, display: "flex", overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, cwPct)}%`, height: "100%", background: T.done, borderRadius: 99 }} />
                    {cwPct > 100 && <div style={{ width: `${Math.min(100, cwPct - 100)}%`, height: "100%", background: T.accent }} />}
                  </div>
                  <div className="num" style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 9 }}>🏋 {cwS.kd}/{cwS.kt} Kraft{cwS.bonusH > 0 ? <span style={{ color: BONUS_COLOR }}> · +{cwS.bonusH.toFixed(1).replace(".0", "")} h Bonus</span> : null}</div>
                  <div style={{ marginTop: 13, paddingTop: 13, borderTop: `1px solid ${T.line}`, display: "flex", flexDirection: "column", gap: 5 }}>
                    <span className="cond" style={{ fontWeight: 600, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: T.inkFaint }}>{next ? "Nächste Einheit" : "Diese Woche erledigt ✓"}</span>
                    {next && <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14, fontWeight: 600, color: T.ink }}><span style={{ width: 4, height: 18, borderRadius: 99, background: TYPE_META[next.d.type].c }} />{next.d.d} · {next.d.title}</span>}
                  </div>
                  <button onClick={() => setRoute("plan")} className="cond" style={{ marginTop: 14, width: "100%", fontWeight: 600, fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase", color: T.accent, background: T.accentSoft, border: "none", borderRadius: 9, padding: 11, cursor: "pointer", minHeight: 42 }}>Zum Trainingsplan →</button>
                </div>
              );
            })()}
            {/* 2) FTP-Kurve */}
            <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14, marginBottom: 10, boxShadow: T.shadowCard }}>
              <div className="cond" style={{ fontWeight: 700, fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase", color: T.ink, padding: "14px 14px 4px" }}>Fortschritt · FTP-Entwicklung</div>
              <div style={{ padding: "0 14px 14px" }}>
                <div style={{ display: "flex", gap: "6px 14px", flexWrap: "wrap", fontSize: 11, color: T.inkSoft, marginBottom: 8 }}>
                  <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: "#C2401C", marginRight: 5, verticalAlign: -1 }} />20-min</span>
                  <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: "#3E6F8E", marginRight: 5, verticalAlign: -1 }} />1-h (Traka-relevant)</span>
                  <span style={{ marginLeft: "auto", fontStyle: "italic" }}>Ramp 242 · Plan 205 W</span>
                </div>
                <LineGraph series={[ftp20, ftp60]} ymin={fmin} ymax={fmax} xlabels={FTP_LOG.map((f) => f.date)} ylabels={[...new Set([fmin, (fmin + fmax) / 2, fmax, 242])].filter((v) => v >= fmin && v <= fmax)} />
                <div style={{ fontSize: 11, color: T.inkSoft, lineHeight: 1.5, marginTop: 7 }}>Steigende 1-h-Power = die aerobe Baustelle schließt sich.</div>
              </div>
            </div>
            {/* 3) Material-Prio */}
            <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14, marginBottom: 10, boxShadow: T.shadowCard }}>
              <div className="cond" style={{ fontWeight: 700, fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase", color: T.ink, padding: "14px 14px 4px" }}>Material · nächste Schritte</div>
              <div style={{ padding: "6px 14px 8px" }}>
                {SETUP_TODOS.filter((t) => !t.done).slice(0, 4).map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: i === 0 ? "none" : `1px solid ${T.line}` }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, flex: "0 0 8px", background: t.done ? T.done : T.accent }} />
                    <span style={{ flex: 1, fontSize: 13, lineHeight: 1.4, color: T.ink }}>{t.txt}</span>
                    {t.when && <span className="num" style={{ fontSize: 11, color: T.inkSoft, whiteSpace: "nowrap" }}>{t.when}</span>}
                  </div>
                ))}
              </div>
              <button onClick={() => setRoute("setup")} className="cond" style={{ margin: "0 14px 14px", width: "calc(100% - 28px)", fontWeight: 600, fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase", color: T.accent, background: T.accentSoft, border: "none", borderRadius: 9, padding: 11, cursor: "pointer", minHeight: 42 }}>Zum Setup →</button>
            </div>
          </>
        )}

        {route === "setup" && (
          <>
            <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14, marginBottom: 10, boxShadow: T.shadowCard }}>
              <div className="cond" style={{ fontWeight: 700, fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase", color: T.ink, padding: "14px 14px 4px" }}>Material · Prioritäten</div>
              <div style={{ padding: "6px 14px 10px" }}>
                {SETUP_TODOS.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: i === 0 ? "none" : `1px solid ${T.line}` }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, flex: "0 0 8px", background: t.done ? T.done : T.accent }} />
                    <span style={{ flex: 1, fontSize: 13, lineHeight: 1.4, color: T.ink }}>{t.txt}</span>
                    {t.when && <span className="num" style={{ fontSize: 11, color: T.inkSoft, whiteSpace: "nowrap" }}>{t.when}</span>}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14, marginBottom: 10, boxShadow: T.shadowCard }}>
              <div className="cond" style={{ fontWeight: 700, fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase", color: T.ink, padding: "14px 14px 4px" }}>Aktuelles Setup</div>
              <div style={{ padding: "4px 0 10px" }}>
                {SETUP_BIKE.map((sb, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "9px 14px", borderTop: i === 0 ? "none" : `1px solid ${T.line}` }}>
                    <span className="cond" style={{ fontWeight: 600, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.03em", color: T.inkSoft, flex: "0 0 110px" }}>{sb.k}</span>
                    <span style={{ fontSize: 13, color: T.ink, lineHeight: 1.4 }}>{sb.v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14, marginBottom: 10, boxShadow: T.shadowCard }}>
              <div className="cond" style={{ fontWeight: 700, fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase", color: T.ink, padding: "14px 14px 4px" }}>Daten sichern</div>
              <div style={{ padding: "0 14px 14px" }}>
                <div style={{ fontSize: 12.5, color: T.inkSoft, lineHeight: 1.5, marginBottom: 10 }}>Häkchen, RPE-Notizen, Readiness und Tagesreihenfolge liegen nur in diesem Browser-Speicher. Als Datei sichern schützt vor Datenverlust.</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => {
                    const data = { version: 1, exported: new Date().toISOString(), progress: done, notes: notes, readiness: readiness, dayorder: dayOrder };
                    const blob = new Blob([JSON.stringify(data, null, 1)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const aEl = document.createElement("a"); aEl.href = url; aEl.download = "jan-training-backup-" + new Date().toISOString().slice(0, 10) + ".json";
                    document.body.appendChild(aEl); aEl.click(); aEl.remove(); URL.revokeObjectURL(url);
                  }} style={{ flex: 1, fontFamily: "inherit", fontWeight: 600, fontSize: 13.5, padding: "11px 8px", borderRadius: 10, border: `1px solid ${T.line}`, background: T.panel2 || "#EFEDE3", color: T.ink, cursor: "pointer", minHeight: 44 }}>⬇ Sichern (JSON)</button>
                  <button onClick={() => { const fi = document.getElementById("backup-file-art"); if (fi) fi.click(); }} style={{ flex: 1, fontFamily: "inherit", fontWeight: 600, fontSize: 13.5, padding: "11px 8px", borderRadius: 10, border: `1px solid ${T.line}`, background: T.panel2 || "#EFEDE3", color: T.ink, cursor: "pointer", minHeight: 44 }}>⬆ Wiederherstellen</button>
                </div>
                <input type="file" id="backup-file-art" accept=".json,application/json" style={{ display: "none" }} onChange={(ev) => {
                  const f = ev.target.files && ev.target.files[0]; if (!f) return;
                  const rd = new FileReader();
                  rd.onload = () => { try {
                    const data = JSON.parse(String(rd.result));
                    if (!data || typeof data !== "object") throw new Error("Ungültiges Format");
                    if (data.progress) { setDone(data.progress); window.storage.set(STORAGE_KEY, JSON.stringify(data.progress)); }
                    if (data.notes) { setNotes(data.notes); window.storage.set(NOTES_KEY, JSON.stringify(data.notes)); }
                    if (data.readiness) { setReadiness(data.readiness); window.storage.set(READINESS_KEY, JSON.stringify(data.readiness)); }
                    if (data.dayorder) { setDayOrder(data.dayorder); window.storage.set(ORDER_KEY, JSON.stringify(data.dayorder)); }
                    alert("Backup wiederhergestellt ✓");
                  } catch (e) { alert("Import fehlgeschlagen: " + (e && e.message)); } };
                  rd.readAsText(f); ev.target.value = "";
                }} />
              </div>
            </div>
          </>
        )}

        {route === "plan" && <>
        {/* Legende */}
        <div style={{ display: "flex", gap: "6px 14px", flexWrap: "wrap", alignItems: "center", fontSize: 11, color: T.inkSoft, padding: "2px 2px 12px" }}>
          <span style={{ fontWeight: 600, color: T.ink }}>Legende:</span>
          {[
            { c: TYPE_META.lang.c, label: "Lange Gravel" },
            { c: TYPE_META.z2.c, label: "Z2 Grundlage" },
            { c: TYPE_META.kraft.c, label: "Kraft" },
            { c: TYPE_META.intens.c, label: "Test/Intensität" },
            { c: TYPE_META.ruhe.c, label: "Ruhe" },
            { c: BONUS_COLOR, label: "Zusatz/Bonus" },
            { c: T.dienst, label: "Dienst" },
          ].map((it, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", gap: 5 }}>
              <span style={{ width: 11, height: 11, minWidth: 11, borderRadius: 3, background: it.c, display: "block", flex: "0 0 11px" }} />{it.label}
            </span>
          ))}
          <button onClick={() => setShowZones(!showZones)} style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, background: T.panel, border: `1px solid ${T.line}`, borderRadius: 8, padding: "8px 12px", cursor: "pointer", color: T.ink }}>{showZones ? "Zonen ausblenden" : "Zonen anzeigen"}</button>
        </div>

        {showZones && (
          <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14, marginBottom: 10, boxShadow: T.shadowCard }}>
            <div className="num" style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "5px 16px", fontSize: 12.5, padding: "11px 14px" }}>
              <span className="cond" style={{ fontWeight: 600, color: T.inkSoft, fontSize: 11, textTransform: "uppercase" }}>Zone</span>
              <span className="cond" style={{ fontWeight: 600, color: T.inkSoft, fontSize: 11, textTransform: "uppercase" }}>Watt</span>
              <span className="cond" style={{ fontWeight: 600, color: T.inkSoft, fontSize: 11, textTransform: "uppercase" }}>Puls</span>
              {ZONES.flatMap((z, i) => [<span key={i + "a"}>{z[0]}</span>, <span key={i + "b"}>{z[1]}</span>, <span key={i + "c"}>{z[2]}</span>])}
            </div>
          </div>
        )}

        {/* Wochen */}
        {WEEKS.map((w) => {
          const wv = weekStats(w, done);
          const open = !!openWeeks[w.id];
          const [ws_, we_] = WEEK_DATES[w.id];
          const cur = today >= ws_ && today <= we_;
          return (
            <div key={w.id} style={{ background: T.panel, border: `1px solid ${cur ? T.accent : T.line}`, borderRadius: 14, marginBottom: 10, overflow: "hidden", boxShadow: cur ? `0 0 0 1px ${T.accent}, ${T.shadowCard}` : T.shadowCard }}>
              <button className="wk" onClick={() => setOpenWeeks({ ...openWeeks, [w.id]: !open })} style={{ width: "100%", display: "block", padding: "12px 14px 11px", background: "transparent", border: "none", textAlign: "left", cursor: "pointer" }}>
                <span style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                  <span className="cond" style={{ fontWeight: 700, fontSize: 20, color: T.accent }}>{w.id}</span>
                  <span className="cond" style={{ fontWeight: 600, fontSize: 17 }}>{w.range}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", padding: "3px 9px", borderRadius: 999, background: w.tag === "Volumen" ? T.accent : T.panel2, color: w.tag === "Volumen" ? "#fff" : T.inkSoft }}>{w.tag}</span>
                  {cur && <span className="cond" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: T.accent }}>● Aktuell</span>}
                  <span className="num" style={{ fontSize: 12, color: T.inkSoft, marginLeft: "auto", whiteSpace: "nowrap" }}>🚴 {wv.rhIst > 0 ? `${wv.rhIst.toFixed(1).replace(".0","")}/${wv.rhPlan.toFixed(1).replace(".0","")} h` : `~${wv.rhPlan.toFixed(1).replace(".0","")} h`}{wv.kt ? ` · 🏋 ${wv.kd}/${wv.kt}` : ""}{wv.bonusH > 0 ? ` · +${wv.bonusH.toFixed(1).replace(".0","")} h` : ""} {open ? "▲" : "▼"}</span>
                </span>
                <span style={{ display: "flex", gap: 3, marginTop: 9, height: 7 }}>
                  {w.days.map((d, i) => {
                    const dn = isDone(done, w.id + "-" + i);
                    const effType = d.actual || d.type;
                    const op = effType === "ruhe" ? 0.15 : dn ? 1 : 0.32;
                    return <span key={i} style={{ flex: 1, borderRadius: 2, background: TYPE_META[effType].c, opacity: d.actual ? 1 : op, boxShadow: d.actual ? `0 0 0 1.5px ${T.bg}, 0 0 0 2.5px ${T.inkFaint}` : "none" }} />;
                  })}
                </span>
                {(() => {
                  const p = wv.rhPlan ? Math.round((wv.rhIst / wv.rhPlan) * 100) : 0;
                  return (
                    <span style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                      <span style={{ flex: 1, height: 5, background: T.line, borderRadius: 99, display: "flex", overflow: "hidden" }}>
                        <span style={{ height: 5, width: `${Math.min(100, p)}%`, background: T.done, borderRadius: 99 }} />
                        {p > 100 && <span style={{ height: 5, width: `${Math.min(100, p - 100)}%`, background: T.accent }} />}
                      </span>
                      <span className="num" style={{ fontSize: 10.5, color: T.inkSoft, whiteSpace: "nowrap", flexShrink: 0 }}>
                        {wv.rhIst > 0 ? `${wv.rhIst.toFixed(1).replace(".0", "")}/${wv.rhPlan.toFixed(1).replace(".0", "")} h · ${p}%` : `Soll ${wv.rhPlan.toFixed(1).replace(".0", "")} h`}
                      </span>
                    </span>
                  );
                })()}
                {open && <span style={{ display: "block", fontSize: 11.5, color: T.inkSoft, marginTop: 7 }}>{w.note}</span>}
              </button>
              {open && (
                <div style={{ borderTop: `1px solid ${T.line}` }}>
                  {orderedDays(w).map(({ d, oi }) => {
                    const i = oi;
                    const key = w.id + "-" + i, rest = d.type === "ruhe" && !d.actual, chk = isDone(done, key), dOpen = openDay === key, nv = notes[key] || {};
                    return (
                      <div key={key}
                        draggable
                        onDragStart={(e) => { setDragKey(key); e.dataTransfer.effectAllowed = "move"; }}
                        onDragOver={(e) => { if (dragKey && dragKey.split("-")[0] === w.id) e.preventDefault(); }}
                        onDrop={(e) => {
                          if (!dragKey || dragKey.split("-")[0] !== w.id) return;
                          e.preventDefault();
                          const r = e.currentTarget.getBoundingClientRect();
                          const below = e.clientY > r.top + r.height / 2;
                          moveDay(w.id, parseInt(dragKey.split("-")[1]), i, below);
                          setDragKey(null);
                        }}
                        style={{ opacity: dragKey === key ? 0.45 : 1 }}>
                        <div onClick={() => d.detail && setOpenDay(dOpen ? null : key)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 14px", borderTop: `1px solid ${T.line}`, opacity: rest ? 0.6 : 1, cursor: d.detail ? "pointer" : "default", minHeight: 48 }}>
                          <span style={{ cursor: "grab", color: T.inkFaint, fontSize: 15, lineHeight: 1, flexShrink: 0, userSelect: "none" }} title="Verschieben">⠿</span>
                          <span style={{ width: 4, alignSelf: "stretch", borderRadius: 99, background: TYPE_META[d.actual || d.type].c, boxShadow: d.actual ? `0 0 0 1.5px ${T.panel}, 0 0 0 2.5px ${T.inkFaint}` : "none" }} />
                          <span className="cond" style={{ fontWeight: 600, fontSize: 15, minWidth: 50 }}>{d.d}</span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontWeight: chk ? 400 : 600, fontSize: 13.5, textDecoration: chk ? "line-through" : "none", color: chk ? T.inkSoft : T.ink }}>{d.title}</span>
                            {d.actual && <span style={{ fontSize: 11.5, color: T.inkFaint, fontWeight: 600, fontStyle: "italic", display: "block", marginTop: 1 }}>↺ tatsächlich: {TYPE_META[d.actual].label} (geplant: {TYPE_META[d.type].label})</span>}
                            {d.sub && <span style={{ fontSize: 11.5, color: T.inkSoft, display: "block", marginTop: 1 }}>{d.sub}{d.detail ? " " + (dOpen ? "▲" : "▼") : ""}</span>}
                            {ACTUAL[key] ? <span style={{ fontSize: 11.5, color: T.done, fontWeight: 600, display: "block" }}>▸ {ACTUAL[key].min} min{ACTUAL[key].hr ? ` · ⌀${ACTUAL[key].hr} bpm` : ""}{ACTUAL[key].w ? ` · ${ACTUAL[key].w} W` : ""}{ACTUAL[key].km ? ` · ${ACTUAL[key].km} km` : ""}{ACTUAL[key].hm ? ` · ${ACTUAL[key].hm} hm` : ""}</span> : null}
                            {nv.rpe || nv.n ? <span style={{ fontSize: 11.5, color: "#8A7141", display: "block" }}>✎ RPE {nv.rpe || "–"}{nv.n ? " · " + nv.n : ""}</span> : null}
                            {BONUS.filter((b) => b.dayKey === key).map((b, bi) => (
                              <span key={"b" + bi} style={{ fontSize: 11.5, color: BONUS_COLOR, fontWeight: 600, display: "block" }}>+ {b.note} · {b.min} min{b.km ? ` · ${b.km} km` : ""} (Bonus, {b.sport})</span>
                            ))}
                          </span>
                          {d.shift && <span className="cond" style={{ fontSize: 11, fontWeight: 600, color: "#fff", background: T.dienst, padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>{d.shift}</span>}
                          {!rest && <button onClick={(ev) => toggle(key, ev)} style={{ width: 30, height: 30, borderRadius: 8, border: `2px solid ${chk ? T.done : T.line}`, background: chk ? T.done : "transparent", color: "#fff", fontSize: 15, cursor: "pointer", flexShrink: 0 }}>{chk ? "✓" : ""}</button>}
                        </div>
                        {dOpen && d.detail && (
                          <div style={{ padding: "10px 14px 13px 78px", fontSize: 12.5, lineHeight: 1.55, color: T.inkSoft, background: T.panel2, borderTop: `1px dashed ${T.line}` }}>
                            {d.detail}
                            <div style={{ marginTop: 11, paddingTop: 10, borderTop: `1px dashed ${T.line}` }}>
                              {(() => { const exp = expectedRPE(d); const flag = rpeFlag(d, nv); return (<>
                              <div className="cond" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Anstrengung (RPE){exp ? <span style={{ fontWeight: 500, color: T.inkFaint, textTransform: "none", letterSpacing: 0 }}> · erwartet {exp[0]}–{exp[1]}</span> : null}</div>
                              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                {[1,2,3,4,5,6,7,8,9,10].map((r) => { const inExp = exp && r >= exp[0] && r <= exp[1]; return (
                                  <button key={r} onClick={(e) => { e.stopPropagation(); setNote(key, { rpe: nv.rpe === r ? undefined : r }); }}
                                    className="num" style={{ width: 32, height: 32, borderRadius: 8, border: `${inExp ? 1.5 : 1}px solid ${nv.rpe === r ? T.accent : inExp ? T.done : T.line}`, background: nv.rpe === r ? T.accent : T.panel, color: nv.rpe === r ? "#fff" : T.ink, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>{r}</button>
                                ); })}
                              </div>
                              {flag && <div style={{ marginTop: 9, padding: "9px 11px", borderRadius: 8, fontSize: 12, lineHeight: 1.5, background: flag.level === "hoch" ? T.accentSoft : "rgba(138,113,65,.10)", borderLeft: `3px solid ${flag.level === "hoch" ? T.accent : "#8A7141"}`, color: T.ink }}>{flag.level === "hoch" ? "⚠" : "ℹ"} Deutlich anstrengender als erwartet ({flag.got} statt {flag.exp[0]}–{flag.exp[1]}). {flag.level === "hoch" ? "Mögliche Ursachen: Ermüdung aus dem Dienst, oder FTP zu hoch. Bei Muster → nächste Einheit lockerer oder FTP prüfen." : "Im Blick behalten, ob das öfter vorkommt."}</div>}
                              </>); })()}
                              <input defaultValue={nv.n || ""} placeholder="Stichwort, z. B. Beine schwer nach Spätdienst" maxLength={120}
                                onClick={(e) => e.stopPropagation()}
                                onBlur={(e) => setNote(key, { n: e.target.value.trim() || undefined })}
                                style={{ width: "100%", marginTop: 9, fontSize: 13, padding: "9px 11px", border: `1px solid ${T.line}`, borderRadius: 8, background: T.panel, color: T.ink, boxSizing: "border-box" }} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {(() => { const rev = REVIEWS.find((r) => r.wk === w.id); return rev ? (
                    <div style={{ padding: "11px 14px", background: T.panel2, borderTop: `2px solid ${T.accent}` }}>
                      <div className="cond" style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.06em", color: T.accent, marginBottom: 7 }}>Wochenanalyse {rev.wk}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                        {[`🚴 ${rev.radH}`, `${rev.lang ? "✓" : "✗"} lange Ausfahrt`, `🏋 ${rev.kraft}`, ...(rev.bonus ? [`+ ${rev.bonus}`] : []), `Z2: ${rev.z2}`].map((k, ki) => (
                          <span key={ki} style={{ fontSize: 11, color: T.inkSoft, background: T.panel, padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>{k}</span>
                        ))}
                      </div>
                      <div style={{ fontSize: 12, lineHeight: 1.5, marginTop: 4 }}><strong style={{ color: T.inkSoft, fontWeight: 600 }}>Fazit:</strong> {rev.fazit}</div>
                      <div style={{ fontSize: 12, lineHeight: 1.5, marginTop: 4 }}><strong style={{ color: T.inkSoft, fontWeight: 600 }}>→ Folgewoche:</strong> {rev.ableitung}</div>
                    </div>
                  ) : null; })()}
                </div>
              )}
            </div>
          );
        })}

        {/* Regeln */}
        <div style={{ background: "transparent", border: `1px dashed ${T.line}`, borderRadius: 14, marginBottom: 10, overflow: "hidden" }}>
          <button onClick={() => setShowRules(!showRules)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
            <span className="cond" style={{ fontWeight: 700, fontSize: 16, textTransform: "uppercase", letterSpacing: "0.06em", color: T.inkSoft }}>Regeln</span>
            <span style={{ fontSize: 11, color: T.inkSoft, flex: 1 }}>Dienstplan, Training, Material &amp; Bedienung</span>
            <span style={{ fontSize: 10, color: T.inkSoft }}>{showRules ? "▲" : "▼"}</span>
          </button>
          {showRules && RULES.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", borderTop: `1px solid ${T.line}`, fontSize: 12.5, lineHeight: 1.5 }}>
              <span className="cond" style={{ fontWeight: 600, fontSize: 12.5, minWidth: 74, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.05em", color: r.cat === "Dienste" ? T.dienst : r.cat === "Training" ? "#3E6F8E" : r.cat === "Material" ? T.accent : r.cat === "Abgleich" ? T.done : T.inkSoft }}>{r.cat}</span>
              <span>{r.text}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11.5, color: T.inkSoft, lineHeight: 1.6, marginTop: 16 }}>Master-Gerät: Häkchen, Notizen und verschobene Einheiten werden lokal gespeichert. Einheiten lassen sich am ⠿-Griff innerhalb der Woche per Drag&amp;Drop verschieben.</p>
        </>}

        {route === "progress" && (
          <>
            {/* Gesamtbilanz */}
            <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14, marginBottom: 10, boxShadow: T.shadowCard, padding: 16 }}>
              <div className="cond" style={{ fontWeight: 600, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: T.accent, marginBottom: 8 }}>Gesamtbilanz · alle 8 Wochen</div>
              <div className="cond num" style={{ fontWeight: 700, fontSize: 34, lineHeight: 1, color: T.ink, marginBottom: 10 }}>{s.hIst.toFixed(1)}<span style={{ fontSize: 16, color: T.inkSoft, fontWeight: 600 }}> / {s.hpPlan.toFixed(0)} h Rad</span> <span style={{ fontSize: 18, color: hpct >= 100 ? T.accent : T.inkSoft, fontWeight: 700 }}>{hpct}%</span></div>
              <div style={{ height: 6, background: "rgba(0,0,0,.06)", borderRadius: 99, display: "flex", overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, hpct)}%`, height: "100%", background: T.done, borderRadius: 99 }} />
                {hpct > 100 && <div style={{ width: `${Math.min(100, hpct - 100)}%`, height: "100%", background: T.accent }} />}
              </div>
              <div className="num" style={{ fontSize: 12.5, color: T.inkSoft, marginTop: 9 }}>🏋 {s.kd}/{s.kt} Kraft{s.bonusH > 0 ? <span style={{ color: BONUS_COLOR }}> · +{s.bonusH.toFixed(1).replace(".0", "")} h Bonus</span> : null}</div>
            </div>
            {/* FTP-Kurve */}
            <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14, marginBottom: 10, boxShadow: T.shadowCard }}>
              <div className="cond" style={{ fontWeight: 700, fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase", color: T.ink, padding: "14px 14px 4px" }}>FTP-Entwicklung (W)</div>
              <div style={{ padding: "0 14px 14px" }}>
                <div style={{ display: "flex", gap: "6px 14px", flexWrap: "wrap", fontSize: 11, color: T.inkSoft, marginBottom: 8 }}>
                  <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: "#C2401C", marginRight: 5, verticalAlign: -1 }} />20-min</span>
                  <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: "#3E6F8E", marginRight: 5, verticalAlign: -1 }} />1-h (Traka-relevant)</span>
                  <span style={{ marginLeft: "auto", fontStyle: "italic" }}>Ramp 242 · Plan 205 W</span>
                </div>
                <LineGraph series={[ftp20, ftp60]} ymin={fmin} ymax={fmax} xlabels={FTP_LOG.map((f) => f.date)} ylabels={[...new Set([fmin, (fmin + fmax) / 2, fmax, 242])].filter((v) => v >= fmin && v <= fmax)} />
                <div style={{ fontSize: 11, color: T.inkSoft, lineHeight: 1.5, marginTop: 7 }}>Steigende 1-h-Power = die aerobe Baustelle schließt sich.</div>
              </div>
            </div>
            {/* Fitness / Ermüdung / Form (PMC) */}
            {(() => {
              const fitPts = { pts: PMC_LOG.map((p, i) => ({ x: i, y: p.fit })), color: "#3E6F8E" };
              const muedPts = { pts: PMC_LOG.map((p, i) => ({ x: i, y: p.mued })), color: "#C2401C" };
              const formPts = { pts: PMC_LOG.map((p, i) => ({ x: i, y: p.form })), color: "#2E5746" };
              const allP = PMC_LOG.flatMap((p) => [p.fit, p.mued, p.form]);
              const pmin = Math.min(...allP, 0) - 10, pmax = Math.max(...allP) + 10;
              const curForm = PMC_LOG[PMC_LOG.length - 1].form;
              const formLabel = curForm > 15 ? "frisch / Tapering-Bereich" : curForm > 5 ? "gut erholt" : curForm > -10 ? "ausgeglichen" : curForm > -30 ? "ermüdet (Trainingsreiz)" : "stark ermüdet";
              return (
                <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14, marginBottom: 10, boxShadow: T.shadowCard }}>
                  <div className="cond" style={{ fontWeight: 700, fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase", color: T.ink, padding: "14px 14px 4px" }}>Fitness · Ermüdung · Form</div>
                  <div style={{ padding: "0 14px 14px" }}>
                    <div style={{ display: "flex", gap: "6px 14px", flexWrap: "wrap", fontSize: 11, color: T.inkSoft, marginBottom: 8 }}>
                      <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: "#3E6F8E", marginRight: 5, verticalAlign: -1 }} />Fitness (42 T)</span>
                      <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: "#C2401C", marginRight: 5, verticalAlign: -1 }} />Ermüdung (7 T)</span>
                      <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: "#2E5746", marginRight: 5, verticalAlign: -1 }} />Form</span>
                    </div>
                    <LineGraph series={[fitPts, muedPts, formPts]} ymin={pmin} ymax={pmax} xlabels={PMC_LOG.map((p) => p.date)} ylabels={[...new Set([pmin, 0, pmax / 2, pmax].map(Math.round))].filter((v) => v >= pmin && v <= pmax)} />
                    <div style={{ fontSize: 11, color: T.inkSoft, lineHeight: 1.5, marginTop: 7 }}>Aktuell: Form {curForm > 0 ? "+" : ""}{curForm} — <strong>{formLabel}</strong>. Form = Fitness − Ermüdung. Hoch + ausgeruht = bereit für harte Einheiten / Rennen; tief = Reiz, braucht Erholung. <em>Basis: Strava Relative Effort, FTP-unabhängig.</em></div>
                  </div>
                </div>
              );
            })()}
            {/* Z2-Effizienz: Watt pro Herzschlag (×100) */}
            {(() => {
              const effAll = [];
              WEEKS.forEach((w) => { w.days.forEach((d, i) => {
                const act = ACTUAL[w.id + "-" + i];
                if (!act || !act.hr || !act.w) return;
                if (d.type !== "z2") return;
                const ws_ = WEEK_DATES[w.id][0];
                const dt = new Date(ws_ + "T12:00:00"); dt.setDate(dt.getDate() + i);
                effAll.push({ t: dt.getTime(), label: dt.getDate() + "." + (dt.getMonth() + 1) + ".", ef: Math.round(act.w / act.hr * 100), indoor: act.sport === "VirtualRide" });
              }); });
              effAll.sort((a, b) => a.t - b.t);
              if (effAll.length < 2) return null;
              const inPts = effAll.map((p, i) => p.indoor ? { x: i, y: p.ef } : null).filter(Boolean);
              const outPts = effAll.map((p, i) => !p.indoor ? { x: i, y: p.ef } : null).filter(Boolean);
              const evs = effAll.map((p) => p.ef);
              const emin = Math.min(...evs) - 6, emax = Math.max(...evs) + 6;
              const effSeries = [];
              if (inPts.length) effSeries.push({ pts: inPts, color: "#3E6F8E" });
              if (outPts.length) effSeries.push({ pts: outPts, color: T.accent });
              return (
                <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14, marginBottom: 10, boxShadow: T.shadowCard }}>
                  <div className="cond" style={{ fontWeight: 700, fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase", color: T.ink, padding: "14px 14px 4px" }}>Z2-Effizienz (Watt je Herzschlag ×100)</div>
                  <div style={{ padding: "0 14px 14px" }}>
                    <div style={{ display: "flex", gap: "6px 14px", flexWrap: "wrap", fontSize: 11, color: T.inkSoft, marginBottom: 8 }}>
                      <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: "#3E6F8E", marginRight: 5, verticalAlign: -1 }} />Indoor (Kickr)</span>
                      <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: T.accent, marginRight: 5, verticalAlign: -1 }} />Outdoor (SRAM)</span>
                    </div>
                    <LineGraph series={effSeries} ymin={emin} ymax={emax} xlabels={effAll.map((p) => p.label)} ylabels={[...new Set([Math.round(emin), Math.round((emin + emax) / 2), Math.round(emax)])]} />
                    <div style={{ fontSize: 11, color: T.inkSoft, lineHeight: 1.5, marginTop: 7 }}>Mehr Watt bei gleichem Z2-Puls = die aerobe Basis wächst — <strong>die Kernmetrik bis zur Traka</strong>. Indoor/Outdoor getrennt (zwei Powermeter, bekannte Diskrepanz). Nur strukturierte Z2-Einheiten; lange Gravel-Fahrten und Tests bleiben außen vor.</div>
                  </div>
                </div>
              );
            })()}
            {/* Wochenumfang */}
            <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14, marginBottom: 10, boxShadow: T.shadowCard }}>
              <div className="cond" style={{ fontWeight: 700, fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase", color: T.ink, padding: "14px 14px 4px" }}>Rad-Wochenumfang (h)</div>
              <div style={{ padding: "0 14px 14px" }}>
                <div style={{ display: "flex", gap: "6px 14px", flexWrap: "wrap", fontSize: 11, color: T.inkSoft, marginBottom: 8 }}>
                  <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: "#3E6F8E", opacity: 0.4, marginRight: 5, verticalAlign: -1 }} />geplant</span>
                  <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: "#3E6F8E", marginRight: 5, verticalAlign: -1 }} />Ist (Strava)</span>
                  <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: "#D14B1F", marginRight: 5, verticalAlign: -1 }} />Volumenwoche</span>
                </div>
                <BarGraph bars={bars} ymax={maxBar} />
                <div style={{ fontSize: 11, color: T.inkSoft, lineHeight: 1.5, marginTop: 7 }}>Kraft separat geführt, fließt nicht in die Rad-Stunden ein.</div>
              </div>
            </div>
            {/* Kraftverlauf */}
            <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14, marginBottom: 10, boxShadow: T.shadowCard }}>
              <div className="cond" style={{ fontWeight: 700, fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase", color: T.ink, padding: "14px 14px 4px" }}>Krafteinheiten je Woche</div>
              <div style={{ padding: "0 14px 14px" }}>
                <BarGraph bars={WEEKS.map((w) => { const wv = weekStats(w, done); return { label: w.id, val: wv.kd, done: wv.kd > 0, big: false }; })} ymax={Math.max(...WEEKS.map((w) => weekStats(w, done).kt), 1) + 0.5} />
                <div style={{ fontSize: 11, color: T.inkSoft, lineHeight: 1.5, marginTop: 7 }}>Erledigte Krafteinheiten pro Woche.</div>
              </div>
            </div>
            {/* Wochenanalysen */}
            <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14, marginBottom: 10, boxShadow: T.shadowCard }}>
              <div className="cond" style={{ fontWeight: 700, fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase", color: T.ink, padding: "14px 14px 4px" }}>Wochenanalysen</div>
              {REVIEWS.length ? [...REVIEWS].reverse().map((r, i) => (
                <div key={i} style={{ padding: "11px 14px", borderTop: `1px solid ${T.line}` }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 7 }}>
                    <span className="cond" style={{ fontWeight: 700, fontSize: 17, color: T.accent }}>{r.wk}</span>
                    {[`🚴 ${r.radH}`, `${r.lang ? "✓" : "✗"} lange Ausfahrt`, `🏋 ${r.kraft}`, ...(r.bonus ? [`+ ${r.bonus}`] : []), `Z2: ${r.z2}`].map((k, ki) => (
                      <span key={ki} style={{ fontSize: 11, color: T.inkSoft, background: T.panel2, padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>{k}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.55, marginTop: 4 }}><strong style={{ color: T.inkSoft, fontWeight: 600 }}>Fazit:</strong> {r.fazit}</div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.55, marginTop: 4 }}><strong style={{ color: T.inkSoft, fontWeight: 600 }}>→ Folgewoche:</strong> {r.ableitung}</div>
                </div>
              )) : <div style={{ padding: "11px 14px", fontSize: 12.5, color: T.inkSoft }}>Noch keine Analysen. Die erste folgt am Ende von W1.</div>}
            </div>
          </>
        )}

        {route === "logbook" && (
          <div>
            <div style={{ fontSize: 12.5, color: T.inkSoft, lineHeight: 1.5, marginBottom: 10, padding: "0 2px" }}>Alle festen Regeln des Trainingsplans, nach Bereich gruppiert. Diese steuern, wie Dienstplan und Training zusammengebracht werden — die Dienst-Regeln ganz oben sind beim Lesen jedes neuen Kalenders zuerst anzuwenden.</div>
            {[["Dienste", "Dienstplan lesen & Tagtypen", T.dienst], ["Training", "Training & Steuerung", "#2E5746"], ["Kraft", "Krafttraining", "#8A7141"], ["Material", "Material & Setup", T.accent], ["Abgleich", "Wöchentlicher Abgleich", "#1F8A8A"], ["Bedienung", "Bedienung", T.inkFaint]].map(([cat, label, color]) => {
              const rules = RULES.filter((r) => r.cat === cat);
              if (!rules.length) return null;
              return (
                <div key={cat} style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14, marginBottom: 10, boxShadow: T.shadowCard, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px 10px", borderLeft: `3px solid ${color}` }}>
                    <span style={{ width: 9, height: 9, borderRadius: 99, background: color, flexShrink: 0 }} />
                    <span className="cond" style={{ fontWeight: 700, fontSize: 14, letterSpacing: "0.03em", textTransform: "uppercase", color: T.ink, flex: 1 }}>{label}</span>
                    <span className="num" style={{ fontSize: 12, color: T.inkSoft }}>{rules.length}</span>
                  </div>
                  {rules.map((r, i) => (
                    <div key={i} style={{ fontSize: 12.5, lineHeight: 1.55, color: T.ink, padding: "10px 14px", borderTop: `1px solid ${T.line}` }}>{r.text}</div>
                  ))}
                </div>
              );
            })}
            <div style={{ fontSize: 11, color: T.inkFaint, lineHeight: 1.5, marginTop: 4, padding: "0 2px" }}>Regeln ändern: in der Datenstruktur RULES pflegen (cat + text).</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 2px 12px", color: T.inkFaint, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              <span style={{ flex: 1, height: 1, background: T.line }} />
              <span>Änderungshistorie</span>
              <span style={{ flex: 1, height: 1, background: T.line }} />
            </div>
            <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14, marginBottom: 10, boxShadow: T.shadowCard }}>
              <div className="cond" style={{ fontWeight: 700, fontSize: 16, letterSpacing: "0.04em", textTransform: "uppercase", color: T.ink, padding: "14px 14px 2px" }}>Updates &amp; Änderungen</div>
              <div className="num" style={{ fontSize: 11, color: T.inkSoft, padding: "0 14px 8px" }}>{CHANGELOG.length} Einträge · zuletzt {CHANGELOG[0].date}</div>
              {CHANGELOG.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", borderTop: `1px solid ${T.line}`, fontSize: 12.5, lineHeight: 1.5 }}>
                  <span className="cond num" style={{ fontWeight: 600, minWidth: 74, flexShrink: 0, color: T.inkSoft }}>{c.date}</span>
                  <span>{c.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
