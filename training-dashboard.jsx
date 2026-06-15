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

const WEEK_DATES={W1:["2026-06-12","2026-06-14"],W2:["2026-06-15","2026-06-21"],W3:["2026-06-22","2026-06-28"],W4:["2026-06-29","2026-07-05"],W5:["2026-07-06","2026-07-12"],W6:["2026-07-13","2026-07-19"],W7:["2026-07-20","2026-07-26"],W8:["2026-07-27","2026-08-02"]};

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
  {d:"Mi 17.",type:"ruhe",title:"Post-Call · Ruhe",sub:"ausnahmslos",h:0,detail:"2–3 h Schlaf in der Nacht — heute zählt nur Regeneration: nachschlafen, essen, Spaziergang ok."},
  {d:"Do 18.",type:"kraft",title:"Kraft 1 vormittags",sub:"Dienst ab 14:45 · Vormittag frei",shift:"Nachtdienst",h:1,detail:Dkraft1},
  {d:"Fr 19.",type:"ruhe",title:"Post-Call · Ruhe",sub:"Fortbildung",h:0},
  {d:"Sa 20.",type:"ruhe",title:"Ruhe",sub:"Fortbildung ganztägig (Sa+So)",h:0},
  {d:"So 21.",type:"ruhe",title:"Ruhe",sub:"Fortbildung ganztägig — lange Ausfahrt entfällt, nicht nachholen",h:0}]},
 {id:"W3",range:"22.–28. Jun",tag:"Entlastung",note:"Spätdienstwoche · Slot 9–11 Uhr · FTP-RETEST Di",days:[
  {d:"Mo 22.",type:"kraft",title:"Kraft 1 · 9–11 Uhr",sub:"",shift:"Spätdienst",h:1,detail:Dkraft1},
  {d:"Di 23.",type:"intens",title:"FTP-RETEST",sub:"vormittags, ausgeruht",shift:"Spätdienst",h:1,detail:Dretest},
  {d:"Mi 24.",type:"ruhe",title:"Ruhe",sub:"",shift:"Spätdienst",h:0},
  {d:"Do 25.",type:"z2",title:"Z2 75′ · 9–11 Uhr",sub:"neue Zonen ab heute",shift:"Spätdienst",h:1.25,detail:"Erste Einheit mit den frischen Zonen aus dem Retest — bewusst ans untere Z2-Ende halten und Gefühl kalibrieren."},
  {d:"Fr 26.",type:"kraft",title:"Kraft 2 oder Ruhe",sub:"nach Gefühl",shift:"Spätdienst",h:1,detail:Dkraft2},
  {d:"Sa 27.",type:"z2",title:"Z2 90′ · vormittags",sub:"",shift:"Spätdienst",h:1.5,detail:Dz2},
  {d:"So 28.",type:"ruhe",title:"Ruhe",sub:"",shift:"Spätdienst",h:0}]},
 {id:"W4",range:"29. Jun – 5. Jul",tag:"Basis",note:"Mo frei · So Tagdienst 7:30–15:30",days:[
  {d:"Mo 29.",type:"z2",title:"Z2 105–120′ Mitteldistanz",sub:"freier Tag · Soll 105′",h:1.75,detail:"Längste Wocheneinheit unter der Woche — reine Z2-Dauer (keine Sprints diese Woche). "+Dz2},
  {d:"Di 30.",type:"kraft",title:"Kraft 1",sub:"abends ab ~17 Uhr",h:1,detail:Dkraft1},
  {d:"Mi 1.7.",type:"z2",title:"Z2 90′ vormittags",sub:"Mitteldistanz · Dienst ab 14:45",shift:"Nachtdienst",h:1.5,detail:Dz2+" MITTELDISTANZ: zweite längere aerobe Einheit der Woche."},
  {d:"Do 2.",type:"ruhe",title:"Post-Call · Ruhe",sub:"",h:0},
  {d:"Fr 3.",type:"z2",title:"Z2 60′ locker",sub:"abends",h:1,detail:Dz2+" Bewusst kurz und leicht — morgen ist die lange Ausfahrt."},
  {d:"Sa 4.",type:"lang",title:"Lange Gravel 3–3,5 h",sub:"Z2 · Soll 3 h",h:3,detail:Dz2+" "+DlangFuel},
  {d:"So 5.",type:"ruhe",title:"Ruhe",sub:"Tagdienst 7:30–15:30",shift:"Tagdienst",h:0}]},
 {id:"W5",range:"6.–12. Jul",tag:"Basis",note:"Nachtdienst Mi · Wochenende frei",days:[
  {d:"Mo 6.",type:"z2",title:"Z2 75′",sub:"abends",h:1.25,detail:Dz2},
  {d:"Di 7.",type:"kraft",title:"Kraft 1",sub:"abends",h:1,detail:Dkraft1},
  {d:"Mi 8.",type:"z2",title:"Z2 90′ vormittags",sub:"Mitteldistanz · Dienst ab 14:45",shift:"Nachtdienst",h:1.5,detail:Dz2+" MITTELDISTANZ: zweite längere aerobe Einheit der Woche."},
  {d:"Do 9.",type:"ruhe",title:"Post-Call · Ruhe",sub:"",h:0},
  {d:"Fr 10.",type:"z2",title:"Z2 60′ + Sprints",sub:"abends",h:1,detail:Dz2+" "+Dsprint},
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
 {id:"W7",range:"20.–26. Jul",tag:"Volumen",note:"dienstfrei — größte Woche der Phase (~9 h)",days:[
  {d:"Mo 20.",type:"z2",title:"Z2 90′",sub:"",h:1.5,detail:Dz2},
  {d:"Di 21.",type:"kraft",title:"Kraft 1",sub:"",h:1,detail:Dkraft1},
  {d:"Mi 22.",type:"z2",title:"Z2 90′ + Sprints",sub:"",h:1.5,detail:Dz2+" "+Dsprint},
  {d:"Do 23.",type:"z2",title:"Z2 60′ ganz locker",sub:"",h:1,detail:"Aktive Erholung mitten in der großen Woche — unteres Z2 oder Z1."},
  {d:"Fr 24.",type:"kraft",title:"Kraft 2",sub:"",h:1,detail:Dkraft2},
  {d:"Sa 25.",type:"lang",title:"Lange Gravel 4 h",sub:"Race-Setup fahren",h:4,detail:"Komplettes Race-Setup testen: 50er-Front + Tire Inserts (Vittoria Air-Liner Light / Tannus) + Race-Sealant vorher montieren. Finale Reifendrücke v/h notieren, Taschen und Verpflegung am Rad wie im Rennen. "+DlangFuel},
  {d:"So 26.",type:"z2",title:"Z2 90–120′ locker",sub:"Back-to-back · Soll 90′",h:1.5,detail:"Müde Beine sind hier Absicht — Vorgeschmack auf Phase 4. Tempo egal, Zeit im Sattel zählt."}]},
 {id:"W8",range:"27. Jul – 2. Aug",tag:"Entlastung",note:"Zahnarzt Mo · Nachtdienst Fr→Sa",days:[
  {d:"Mo 27.",type:"ruhe",title:"Ruhe",sub:"Zahnarzt",h:0},
  {d:"Di 28.",type:"z2",title:"Z2 60′",sub:"abends",h:1,detail:Dz2},
  {d:"Mi 29.",type:"kraft",title:"Kraft 1",sub:"abends",h:1,detail:Dkraft1},
  {d:"Do 30.",type:"z2",title:"Z2 60′",sub:"abends",h:1,detail:Dz2+" Ohne Sprints (Entlastungswoche)."},
  {d:"Fr 31.",type:"z2",title:"Z2 45–60′ vormittags",sub:"Dienst ab 14:45 · Vormittag frei",shift:"Nachtdienst",h:0.75,detail:"Entlastungswoche: ganz locker rollen, optional streichen."},
  {d:"Sa 1.8.",type:"ruhe",title:"Post-Call · Ruhe",sub:"",h:0},
  {d:"So 2.",type:"z2",title:"Z2 90′ locker",sub:"August-Plan folgt",h:1.5,detail:Dz2}]}
];

const RULES=[
 {cat:"Dienste",text:"Nachtdienst 14:45 → ~9:00 Folgetag (2–3 h Schlaf). Post-Call = Ruhetag, ausnahmslos."},
 {cat:"Dienste",text:"Vor einem Nachtdienst ist der Vormittag frei und trainierbar — aber nur max. Z2 + kurze Sprints, spätestens 12 Uhr fertig."},
 {cat:"Dienste",text:"1 blockierter Wochenendtag im Kalender = Tagdienst 7:30–15:30. 2 zusammenhängende Tage = Nachtdienst."},
 {cat:"Dienste",text:"Spätdienst 13:00–21:30 (oft bis 23 Uhr): Trainingsslot 9–11 Uhr, reduzierter Umfang. Spätdienstwochen zählen als Entlastung."},
 {cat:"Dienste",text:"Reguläre Arbeitstage 6:45–16:30: Einheiten abends ab ~17 Uhr."},
 {cat:"Training",text:"Lange Ausfahrten nur an freien Wochenendtagen."},
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

const ZONES=[["Z1 Regeneration","< 125 W","< 128"],["Z2 Grundlage","125–170 W","128–158"],["Z3 Tempo","171–203 W","159–174"],["Sweet Spot","199–210 W","165–175"],["Z4 Schwelle","204–237 W","175–189"],["Z5 VO2max","238–271 W","190+"]];

const FTP_LOG=[
 {date:"06.06",label:"Sella Ronda",p20:197,p60:179},
 {date:"14.06",label:"Aubachtal",p20:199,p60:147},
 // Nächster Punkt: FTP-Retest 23.06.
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
};
const REVIEWS = [
  { wk: "W1", radH: "3,9 h (Soll ~3 h)", lang: true, z2: "sauber (Sa Ø119 bpm, max 158)", kraft: "3/3", bonus: "Lauf 36′ / 5,1 km",
    fazit: "Sehr solider Auftakt, mehr Volumen als geplant: 3× Kraft (82/85/71 min) + Lauf-Bonus + 2 Radtage, gesamt ~8,5 h. Samstag mustergültig ruhig (Z1–Z2, Ø119 bpm). Sonntag Aubachtal-Trail bewusst härter (Ø159 bpm, Z3, RPE ~7). Power-Profil bestätigt das Bild: kräftige Beine (5s 678 W), aerobe Dauerleistung noch die Baustelle (1h 94–147 W).",
    ableitung: "W2 ruhig angehen, Z2 strikt nach Puls (128–158). Fortbildung Sa+So streicht die lange Ausfahrt — bewusst keine Kompensation, W2 als leichtere Woche vor dem FTP-Retest (Di 23.6.) nehmen." },
];

const BONUS = [
  { wk: "W1", dayKey: "W1-2", date: "10.06", sport: "Run", min: 36, km: 5.1, note: "Z2-Lauf morgens" },
];

const BONUS_COLOR = "#1F8A8A";
const TYPE_META = TYPE;
const STORAGE_KEY = "jan-training-progress-v2";
const NOTES_KEY = "jan-training-notes-v2";
const RIDE = ["z2", "lang", "intens"];
const isDone = (done, key) => !!done[key] || !!ACTUAL[key];

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
  bg: "#E9E7DF", panel: "#FCFBF7", panel2: "#F2F0E8", ink: "#20261F",
  inkSoft: "#5B655C", line: "#D6D3C7", accent: "#D14B1F", done: "#2E5746", dienst: "#7A3E8F",
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

  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get(STORAGE_KEY); if (r?.value) setDone(JSON.parse(r.value)); } catch (e) {}
      try { const r = await window.storage.get(NOTES_KEY); if (r?.value) setNotes(JSON.parse(r.value)); } catch (e) {}
    })();
  }, []);

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
        :root{--lang:#2E5746;--z2:#3E6F8E;--kraft:#8A7141;--intens:#C2401C;--ruhe:#A8ADA6;--bonus:#1F8A8A;--dienst:#7A3E8F;--done:#2E5746;--accent:#D14B1F;}
        @media (prefers-color-scheme: dark){:root{--lang:#5E9C82;--z2:#6FA3C4;--kraft:#C0A36E;--intens:#E8642F;--ruhe:#5C645D;--bonus:#4FC4C4;--dienst:#B07CC4;--done:#5E9C82;--accent:#E8642F;}}
        .cond{font-family:'Barlow Condensed',sans-serif}
        .num{font-variant-numeric:tabular-nums}
        .wk:hover{background:#F2F0E8}`}</style>

      {/* Kopf */}
      <header style={{ background: "linear-gradient(180deg,#242B23,#20261F)", color: "#EFEDE3", padding: "22px 18px 18px" }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <div className="cond" style={{ fontWeight: 600, letterSpacing: "0.2em", fontSize: 11, color: T.accent, textTransform: "uppercase" }}>
            Phase 1 · Basis · ~{wTraka} Wochen bis The Traka
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 14 }}>
            <h1 className="cond" style={{ fontWeight: 700, fontSize: 40, margin: "2px 0 0", lineHeight: 0.95, textTransform: "uppercase" }}>Mikroplan<br />12.06–02.08</h1>
            <div style={{ textAlign: "right" }}>
              <div className="cond num" style={{ fontWeight: 700, fontSize: 38, lineHeight: 0.9 }}>{pct}<span style={{ fontSize: 19 }}>%</span></div>
              <div className="num" style={{ fontSize: 11, color: "#A9B0A4", marginTop: 3 }}>insgesamt: 🚴 {s.hIst.toFixed(1)} / {s.hpPlan.toFixed(0)} h ({hpct}%){s.bonusH ? <span style={{ color: BONUS_COLOR }}> +{s.bonusH.toFixed(1)} h Bonus</span> : null} &nbsp;·&nbsp; 🏋 {s.kd}/{s.kt}</div>
            </div>
          </div>
          <div style={{ marginTop: 14, height: 5, background: "rgba(255,255,255,.12)", borderRadius: 99, display: "flex", position: "relative" }}>
            <div style={{ width: `${Math.min(100, hpct)}%`, height: "100%", background: T.done, borderRadius: hpct >= 100 ? "99px" : "99px 0 0 99px", transition: "width .45s cubic-bezier(.16,1,.3,1)" }} />
            {hpct > 100 && <div style={{ width: `${Math.min(100, hpct - 100)}%`, height: "100%", background: T.accent, borderRadius: "0 99px 99px 0" }} />}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 10.5, color: "#A9B0A4" }}>
            <span>Ist {hpct}% vom Soll</span>
            {hpct > 100 ? <span style={{ color: T.accent }}>+{hpct - 100}% extra</span> : hpct > 0 ? <span>{100 - hpct}% bis Soll</span> : null}
          </div>
          <div style={{ display: "flex", gap: "8px 16px", marginTop: 12, flexWrap: "wrap", fontSize: 12, color: "#B9BFB2" }}>
            <span><strong style={{ color: "#EFEDE3" }}>FTP:</strong> 226 W hinterlegt · real ~190–200 W → Z2 bis Retest 23.06. nach Puls (128–158)</span>
            <span><strong style={{ color: "#EFEDE3" }}>Gewicht:</strong> 89 kg → 2,5 W/kg</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 920, margin: "0 auto", padding: "14px 14px 44px" }}>
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
          <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, marginBottom: 10 }}>
            <div className="num" style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "5px 16px", fontSize: 12.5, padding: "11px 14px" }}>
              <span className="cond" style={{ fontWeight: 600, color: T.inkSoft, fontSize: 11, textTransform: "uppercase" }}>Zone</span>
              <span className="cond" style={{ fontWeight: 600, color: T.inkSoft, fontSize: 11, textTransform: "uppercase" }}>Watt</span>
              <span className="cond" style={{ fontWeight: 600, color: T.inkSoft, fontSize: 11, textTransform: "uppercase" }}>Puls</span>
              {ZONES.flatMap((z, i) => [<span key={i + "a"}>{z[0]}</span>, <span key={i + "b"}>{z[1]}</span>, <span key={i + "c"}>{z[2]}</span>])}
            </div>
          </div>
        )}

        {/* Fortschritt & Kurven */}
        <div style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
          <button onClick={() => setShowStats(!showStats)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
            <span className="cond" style={{ fontWeight: 700, fontSize: 16, textTransform: "uppercase", letterSpacing: "0.06em", color: T.inkSoft }}>Fortschritt &amp; Kurven</span>
            <span style={{ fontSize: 11, color: T.inkSoft, flex: 1 }}>FTP-Entwicklung · Wochenumfang</span>
            <span style={{ fontSize: 10, color: T.inkSoft }}>{showStats ? "▲" : "▼"}</span>
          </button>
          {showStats && (
            <div style={{ padding: "6px 14px 16px" }}>
              <div className="cond" style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>FTP-Schätzung aus Strava (W)</div>
              <div style={{ display: "flex", gap: "6px 14px", flexWrap: "wrap", fontSize: 11, color: T.inkSoft, marginBottom: 8 }}>
                <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: "#C2401C", marginRight: 5, verticalAlign: -1 }} />20-min-Power</span>
                <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: "#3E6F8E", marginRight: 5, verticalAlign: -1 }} />1-h-Power (Traka-relevant)</span>
                <span style={{ marginLeft: "auto", fontStyle: "italic" }}>Ziel 226 W</span>
              </div>
              <LineGraph series={[ftp20, ftp60]} ymin={fmin} ymax={fmax} xlabels={FTP_LOG.map((f) => f.date)}
                ylabels={[...new Set([fmin, (fmin + fmax) / 2, fmax, 226])].filter((v) => v >= fmin && v <= fmax)} />
              <div style={{ fontSize: 11, color: T.inkSoft, lineHeight: 1.5, marginTop: 7 }}>Steigende 1-h-Power = die aerobe Baustelle schließt sich. Genau das soll bis Traka passieren.</div>

              <div className="cond" style={{ fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.05em", margin: "18px 0 6px" }}>Rad-Wochenumfang (h)</div>
              <div style={{ display: "flex", gap: "6px 14px", flexWrap: "wrap", fontSize: 11, color: T.inkSoft, marginBottom: 8 }}>
                <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: "#3E6F8E", opacity: 0.4, marginRight: 5, verticalAlign: -1 }} />geplant</span>
                <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: "#3E6F8E", marginRight: 5, verticalAlign: -1 }} />voll = Ist (Strava)</span>
                <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: "#D14B1F", marginRight: 5, verticalAlign: -1 }} />Volumenwoche</span>
              </div>
              <BarGraph bars={bars} ymax={maxBar} />
              <div style={{ fontSize: 11, color: T.inkSoft, lineHeight: 1.5, marginTop: 7 }}>Kraft wird separat geführt (Zähler je Woche) und fließt nicht in die Rad-Stunden ein.</div>
            </div>
          )}
        </div>

        {/* Wochen */}
        {WEEKS.map((w) => {
          const wv = weekStats(w, done);
          const open = !!openWeeks[w.id];
          const [ws_, we_] = WEEK_DATES[w.id];
          const cur = today >= ws_ && today <= we_;
          return (
            <div key={w.id} style={{ background: T.panel, border: `1px solid ${cur ? T.accent : T.line}`, borderRadius: 12, marginBottom: 10, overflow: "hidden", boxShadow: cur ? `0 0 0 1px ${T.accent}` : "none" }}>
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
                    const op = d.type === "ruhe" ? 0.15 : dn ? 1 : 0.32;
                    return <span key={i} style={{ flex: 1, borderRadius: 2, background: TYPE_META[d.type].c, opacity: op }} />;
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
                  {w.days.map((d, i) => {
                    const key = w.id + "-" + i, rest = d.type === "ruhe", chk = isDone(done, key), dOpen = openDay === key, nv = notes[key] || {};
                    return (
                      <div key={key}>
                        <div onClick={() => d.detail && setOpenDay(dOpen ? null : key)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderTop: i === 0 ? "none" : `1px solid ${T.line}`, opacity: rest ? 0.6 : 1, cursor: d.detail ? "pointer" : "default", minHeight: 48 }}>
                          <span style={{ width: 4, alignSelf: "stretch", borderRadius: 2, background: TYPE_META[d.type].c }} />
                          <span className="cond" style={{ fontWeight: 600, fontSize: 15, minWidth: 50 }}>{d.d}</span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontWeight: chk ? 400 : 600, fontSize: 13.5, textDecoration: chk ? "line-through" : "none", color: chk ? T.inkSoft : T.ink }}>{d.title}</span>
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
                              <div className="cond" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Anstrengung (RPE)</div>
                              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                {[1,2,3,4,5,6,7,8,9,10].map((r) => (
                                  <button key={r} onClick={(e) => { e.stopPropagation(); setNote(key, { rpe: nv.rpe === r ? undefined : r }); }}
                                    className="num" style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${nv.rpe === r ? T.accent : T.line}`, background: nv.rpe === r ? T.accent : T.panel, color: nv.rpe === r ? "#fff" : T.ink, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>{r}</button>
                                ))}
                              </div>
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

        {/* Wochenanalyse */}
        <div style={{ background: "transparent", border: `1px dashed ${T.line}`, borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
          <button onClick={() => setShowReview(!showReview)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
            <span className="cond" style={{ fontWeight: 700, fontSize: 16, textTransform: "uppercase", letterSpacing: "0.06em", color: T.inkSoft }}>Wochenanalyse</span>
            <span style={{ fontSize: 11, color: T.inkSoft, flex: 1 }}>Soll-Ist je Woche · {REVIEWS.length} {REVIEWS.length === 1 ? "Eintrag" : "Einträge"}</span>
            <span style={{ fontSize: 10, color: T.inkSoft }}>{showReview ? "▲" : "▼"}</span>
          </button>
          {showReview && [...REVIEWS].reverse().map((r, i) => (
            <div key={i} style={{ padding: "11px 14px", borderTop: `1px solid ${T.line}` }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 7 }}>
                <span className="cond" style={{ fontWeight: 700, fontSize: 17, color: T.accent }}>{r.wk}</span>
                {[`🚴 ${r.radH}`, `${r.lang ? "✓" : "✗"} lange Ausfahrt`, `🏋 ${r.kraft}`, `Z2: ${r.z2}`].map((k, ki) => (
                  <span key={ki} style={{ fontSize: 11, color: T.inkSoft, background: T.panel2, padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>{k}</span>
                ))}
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.55, marginTop: 4 }}><strong style={{ color: T.inkSoft, fontWeight: 600 }}>Fazit:</strong> {r.fazit}</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.55, marginTop: 4 }}><strong style={{ color: T.inkSoft, fontWeight: 600 }}>→ Folgewoche:</strong> {r.ableitung}</div>
            </div>
          ))}
        </div>

        {/* Updates */}
        <div style={{ background: "transparent", border: `1px dashed ${T.line}`, borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
          <button onClick={() => setShowLog(!showLog)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
            <span className="cond" style={{ fontWeight: 700, fontSize: 16, textTransform: "uppercase", letterSpacing: "0.06em", color: T.inkSoft }}>Updates &amp; Änderungen</span>
            <span className="num" style={{ fontSize: 11, color: T.inkSoft, flex: 1 }}>{CHANGELOG.length} Einträge · zuletzt {CHANGELOG[0].date}</span>
            <span style={{ fontSize: 10, color: T.inkSoft }}>{showLog ? "▲" : "▼"}</span>
          </button>
          {showLog && CHANGELOG.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", borderTop: `1px solid ${T.line}`, fontSize: 12.5, lineHeight: 1.5 }}>
              <span className="cond num" style={{ fontWeight: 600, minWidth: 74, flexShrink: 0, color: T.inkSoft }}>{c.date}</span>
              <span>{c.text}</span>
            </div>
          ))}
        </div>

        {/* Regeln */}
        <div style={{ background: "transparent", border: `1px dashed ${T.line}`, borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
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

        <p style={{ fontSize: 11.5, color: T.inkSoft, lineHeight: 1.6, marginTop: 16 }}>Dieses Dashboard ist synchron mit der iPhone-App (PWA v11). Fortschritt wird im Artifact gespeichert; Graph-Datenpunkte pflegen wir beim Sonntags-Abgleich.</p>
      </main>
    </div>
  );
}
