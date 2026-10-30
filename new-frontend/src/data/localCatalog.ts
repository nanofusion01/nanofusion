/** Doplňkový obsah stránky služby (texty, výhody, postup) podle adresy služby. */
export interface ServiceCatalogEntry {
  title: string;
  price_key: string;
  badge: string;
  subtitle: string;
  what_included: string;
  benefits: { title: string; desc: string }[];
  process: { step: string; title: string; desc: string }[];
  process_note: string;
}

export const localCatalog: Record<string, ServiceCatalogEntry> = {
    'cisteni-fasad': {
        title: 'Čištění fasád',
        price_key: 'facade',
        badge: 'PRÉMIOVÁ OCHRANA',
        subtitle: 'Hloubkové odstranění řas, plísní a atmosférických nečistot. Ochrana se zárukou až 10 let.',
        what_included: 'Řasy, plísně, smog a vlhkost fasády nejen oškliví, ale postupně ji poškozují. Včasné čištění a ochrana vás ušetří od drahých oprav. Naneseme speciální přípravek na organické nečistoty, naneseme aktivní pěnu a fasádu šetrně opláchneme nízkotlakým paprskem s regulovaným tlakem (max 60 barů). Tento tlak je dost silný na to, aby fasádu vyčistil, a zároveň ji nepoškodil. Na závěr fasádu ošetříme a naneseme prémiovou nano impregnaci.',
        benefits: [
            { title: 'Odstranění řas a plísní', desc: 'Vyčistíme fasádu od smogu, plísní, řas, prachu a organických nánosů.' },
            { title: 'Nano-ochrana až 10 let', desc: 'Špičková impregnace odpuzuje vodu a chrání povrch před špínou.' },
            { title: 'Nízkotlaké mytí', desc: 'Čistíme šetrně s regulovaným tlakem bez poškození fasádních omítek.' },
            { title: 'Záruka a garance', desc: 'Dlouhodobá záruka na opětovný výskyt organických nečistot.' }
        ],
        process: [
            { step: '01', title: 'Posouzení', desc: 'Zhodnotíme stav omítky a navrhneme vhodný čisticí postup.' },
            { step: '02', title: 'Zakrytí', desc: 'Bezpečně ochráníme okna, rostliny a bezprostřední okolí domu.' },
            { step: '03', title: 'Mytí', desc: 'Aplikace aktivní pěny a šetrné očištění nízkotlakou vodou.' },
            { step: '04', title: 'Impregnace', desc: 'Nanesení finální ochranné nano-impregnace s dlouhou životností.' }
        ],
        process_note: 'Běžný rodinný dům stihneme vyčistit a naimpregnovat za 1 až 2 dny.',
    },
    'roof': {
        title: 'Čištění střech',
        price_key: 'roof',
        badge: 'PRODLOUŽENÍ ŽIVOTNOSTI',
        subtitle: 'Šetrné čištění střešní krytiny od mechů a lišejníků. Nano impregnace s garancí až 7 let.',
        what_included: 'Odstraňujeme mechy, řasy a lišejníky ze všech druhů střešních krytin. Používáme šetrné metody a regulovaný tlak vody, který krytinu nepoškodí. Po vyčištění aplikujeme dezinfekční postřik proti mechům a následně špičkovou nano impregnaci, která zamezí usazování nečistot a pronikání vody.',
        benefits: [
            { title: 'Všechny typy krytin', desc: 'Čistíme tašky pálené, betonové, plechové, šindel i eternit.' },
            { title: 'Prevence zatékání', desc: 'Odstraněním mechu zamezíme zadržování vody a degradaci krytiny.' },
            { title: 'Hydrofobní ochrana', desc: 'Nano impregnace odpuzuje vodu a poskytuje samočistící efekt.' },
            { title: 'Čištění okapů', desc: 'Součástí každé realizace je vyčištění a kontrola okapových žlabů.' }
        ],
        process: [
            { step: '01', title: 'Zajištění', desc: 'Kotvení lan a příprava na bezpečnou práci ve výškách.' },
            { step: '02', title: 'Čištění', desc: 'Hloubkový oplach střechy shora dolů tlakovou vodou.' },
            { step: '03', title: 'Dezinfekce', desc: 'Postřik proti mechům hubící mikroskopické zárodky a spory.' },
            { step: '04', title: 'Impregnace', desc: 'Aplikace hydrofobního nano nátěru s ochranou až na 7 let.' }
        ],
        process_note: 'Čištění a ochranu střechy rodinného domu dokončíme za 1 až 2 pracovní dny.',
    },
    'pavement': {
        title: 'Čištění dlažeb',
        price_key: 'pavement',
        badge: 'VZHLED NOVÉHO POVRCHU',
        subtitle: 'Odstranění mechů, plevele, olejových skvrn a zašlé špíny ze zámkové dlažby a betonu.',
        what_included: 'Čistíme zámkovou dlažbu, betonové plochy, terasy a přírodní kámen pomocí horké vody a speciálních rotačních čističů. Spáry zbavíme plevele a mechu. Po vyschnutí doplníme křemičitý písek do spár a dlažbu ošetříme impregnací nebo oživovacím nátěrem.',
        benefits: [
            { title: 'Horkovodní mytí', desc: 'Teplota vody až 90 °C rozpustí i hluboko zažranou mastnotu a oleje.' },
            { title: 'Likvidace plevele', desc: 'Kompletně vyčistíme spáry a zamezíme dalšímu růstu vegetace.' },
            { title: 'Ochrana povrchu', desc: 'Impregnace brání vsakování olejů a výrazně usnadňuje údržbu.' },
            { title: 'Doplnění spár', desc: 'Zasypání spár křemičitým pískem pro stabilitu a pevnost dlažby.' }
        ],
        process: [
            { step: '01', title: 'Příprava', desc: 'Odklizení překážek, hrubé zametení plochy a příprava techniky.' },
            { step: '02', title: 'Horké čištění', desc: 'Hloubkové mytí rotačním strojem bez rozstřiku nečistot.' },
            { step: '03', title: 'Zásyp spár', desc: 'Po vyschnutí plochy spáry kompletně zasypeme křemičitým pískem.' },
            { step: '04', title: 'Impregnace', desc: 'Aplikace hydrofobního nátěru pro trvalou čistotu a oživení barev.' }
        ],
        process_note: 'Dlažbu kolem běžného domu vyčistíme, zapískujeme a ošetříme za 1 den.',
    },
    'pv': {
        title: 'Solární panely',
        price_key: 'pv',
        badge: 'VYŠŠÍ ÚČINNOST',
        subtitle: 'Profesionální čištění solárních panelů pomocí šetrných kartáčů a demineralizované vody.',
        what_included: 'Odstraňujeme prach, pyl, ptačí trus a smog z fotovoltaických panelů. Používáme výhradně demineralizovanou vodu a speciální rotační kartáče, které povrch nepoškrábou. Na čisté panely nanášíme keramickou nano ochranu se samočistícím efektem.',
        benefits: [
            { title: 'Zvýšení výkonu FVE', desc: 'Čisté panely generují až o 25 % více elektrické energie.' },
            { title: 'Demineralizovaná voda', desc: 'Voda zbavená minerálů nezanechává šmouhy ani vodní kámen.' },
            { title: 'Keramická ochrana', desc: 'Keramická vrstva odpuzuje nečistoty a prach spláchne déšť.' },
            { title: 'Šetrný postup', desc: 'Měkké kartáče bezpečné pro antireflexní vrstvu panelů.' }
        ],
        process: [
            { step: '01', title: 'Kontrola', desc: 'Vizuální inspekce stavu a zapojení panelů před zahájením mytí.' },
            { step: '02', title: 'Mytí vodou', desc: 'Mytí demineralizovanou vodou bez chemických přísad.' },
            { step: '03', title: 'Aplikace', desc: 'Nanesení tekuté keramické nano ochrany na povrch panelů.' },
            { step: '04', title: 'Měření', desc: 'Zadokumentování čistého stavu panelů pro vyhodnocení.' }
        ],
        process_note: 'Realizaci na rodinném domě stíháme obvykle za 2 až 4 hodiny.',
    },
    'graffiti': {
        title: 'Odstranění graffiti',
        price_key: 'graffiti',
        badge: 'RYCHLÁ POMOC',
        subtitle: 'Šetrné a rychlé odstranění graffiti ze všech typů povrchů a aplikace antigraffiti nátěru.',
        what_included: 'Odstraňujeme graffiti a tagy z fasád, betonu, cihel, kamene i plastu. Používáme speciální čisticí gely šetrné k podkladu. Po vyčištění doporučujeme aplikovat antigraffiti nátěr, ze kterého lze příští graffiti smýt pouhou teplou vodou.',
        benefits: [
            { title: 'Šetrná chemie', desc: 'Odstraňujeme barvy bez porušení podkladové omítky.' },
            { title: 'Antigraffiti ochrana', desc: 'Ochranný nátěr usnadní budoucí čištění a šetří náklady.' },
            { title: 'Rychlý výjezd', desc: 'Graffiti odstraňujeme co nejrychleji, aby neprovokovalo další.' },
            { title: 'Všechny materiály', desc: 'Poradíme si s cihlou, pískovcem, zateplením i dřevem.' }
        ],
        process: [
            { step: '01', title: 'Testování', desc: 'Zkušební vzorek pro výběr správného rozpouštědla.' },
            { step: '02', title: 'Aplikace', desc: 'Nanesení gelu na graffiti a rozpuštění barev.' },
            { step: '03', title: 'Oplach', desc: 'Opláchnutí horkou vodou pod regulovaným tlakem.' },
            { step: '04', title: 'Prevence', desc: 'Aplikace transparentní antigraffiti ochrany.' }
        ],
        process_note: 'Běžné graffiti na fasádě odstraníme a ošetříme během 2 až 5 hodin.',
    },
    'industrial': {
        title: 'Průmyslové čištění',
        price_key: 'industrial',
        badge: 'B2B ŘEŠENÍ',
        subtitle: 'Komplexní čištění průmyslových hal, výrobních provozů a skladů za plného chodu.',
        what_included: 'Nabízíme průmyslové mytí podlah, ocelových konstrukcí, opláštění hal, rozvodů a technologií. Používáme těžkou techniku a certifikovanou průmyslovou chemii. Práce provádíme i o víkendech nebo za provozu.',
        benefits: [
            { title: 'Práce za provozu', desc: 'Minimalizujeme omezení vaší výroby nebo skladování.' },
            { title: 'Profesionální technika', desc: 'Využíváme plošiny, podlahové mycí stroje a horkovodní čištění.' },
            { title: 'Bezpečnost práce', desc: 'Náš tým má veškerá školení pro práci ve výškách a s technikou.' },
            { title: 'Ekologická likvidace', desc: 'Likvidujeme odpadní vody a nečistoty dle platných norem.' }
        ],
        process: [
            { step: '01', title: 'Audit', desc: 'Prohlídka objektu a vypracování plánu prací.' },
            { step: '02', title: 'Zabezpečení', desc: 'Vymezení pracovních zón a ochrana technologií.' },
            { step: '03', title: 'Čištění', desc: 'Mytí konstrukcí, opláštění a hloubkové mytí podlah.' },
            { step: '04', title: 'Předání', desc: 'Kontrolní předání a ekologická likvidace odpadu.' }
        ],
        process_note: 'Časový harmonogram přizpůsobíme plně vašim směnám a požadavkům.',
    },
    'facade-paint': {
        title: 'Nátěry fasád',
        price_key: 'facade-paint',
        badge: 'NOVÝ VZHLED',
        subtitle: 'Prémiové nátěry fasád barvami Caparol se zárukou stálosti pigmentu až 14 let.',
        what_included: 'Ve spolupráci s německým výrobcem barev Caparol nabízíme kompletní renovaci a nátěry fasád rodinných a bytových domů. Před samotným nátěrem fasádu hloubkově vyčistíme, sanujeme trhliny a naneseme penetrační nátěr.',
        benefits: [
            { title: 'Barvy Caparol', desc: 'Používáme nejkvalitnější silikonové a nano-křemíkové barvy.' },
            { title: 'Garance 14 let', desc: 'Záruka na stálost barevného odstínu a ochranu před řasami.' },
            { title: 'Příprava v ceně', desc: 'Hloubkové očištění fasády před nátěrem je součástí služby.' },
            { title: 'Oprava prasklin', desc: 'Sanujeme drobné trhliny a nerovnosti omítky.' }
        ],
        process: [
            { step: '01', title: 'Příprava', desc: 'Čištění fasády tlakovou vodou a sanace řas.' },
            { step: '02', title: 'Opravy', desc: 'Tmelení prasklin a vysprávky poškozené omítky.' },
            { step: '03', title: 'Penetrace', desc: 'Nanesení podkladového nátěru pro sjednocení savosti.' },
            { step: '04', title: 'Nátěr', desc: 'Dvojitý nátěr prémiovou fasádní barvou Caparol.' }
        ],
        process_note: 'Nátěr rodinného domu trvá obvykle 3 až 5 dní v závislosti na počasí.',
    },
    'roof-paint': {
        title: 'Nátěry střech',
        price_key: 'roof-paint',
        badge: 'DLOUHODOBÁ OCHRANA',
        subtitle: 'Nátěry střešních krytin dvousložkovými barvami se samočistícím efektem a životností 20 let.',
        what_included: 'Provádíme nátěry betonových, taškových a plechových střech. Používáme dvousložkové polyuretanové a akrylátové barvy odolné vůči UV záření a krupobití. Střechu před nátěrem dokonale vyčistíme a odmastíme.',
        benefits: [
            { title: 'Životnost až 20 let', desc: 'Kvalitní dvousložkové barvy chrání střechu na dvě dekády.' },
            { title: 'Samočistící efekt', desc: 'Hladký povrch brání usazování mechů a prachu.' },
            { title: 'UV stabilita', desc: 'Barvy neblednou a chrání krytinu před popraskáním.' },
            { title: 'Příprava v ceně', desc: 'Hloubkové tlakové čištění střechy je v ceně nátěru.' }
        ],
        process: [
            { step: '01', title: 'Mytí', desc: 'Tlakové čištění a odmaštění povrchu krytiny.' },
            { step: '02', title: 'Penetrace', desc: 'Nanesení základové barvy pro vysokou přilnavost.' },
            { step: '03', title: 'První nátěr', desc: 'Aplikace první vrstvy ochranného nátěru.' },
            { step: '04', title: 'Druhý nátěr', desc: 'Finální nátěr pro dokonalý vzhled a trvanlivost.' }
        ],
        process_note: 'Nátěr střechy rodinného domu zabere 2 až 3 pracovní dny.',
    },
    'impregnation': {
        title: 'Nano impregnace',
        price_key: 'impregnation',
        badge: 'NANO OCHRANA',
        subtitle: 'Dlouhodobá hydrofobní a oleofobní impregnace fasád, střech, kamene a dlažeb.',
        what_included: 'Aplikujeme nejmodernější hydrofobní nano impregnace na porézní stavební materiály. Nano částice proniknou hluboko do struktury materiálu, kde vytvoří neviditelnou ochrannou vrstvu, která odpuzuje vodu a nečistoty.',
        benefits: [
            { title: 'Odpuzování vody', desc: 'Voda stéká v kapkách (tzv. lotosový efekt) a nevsakuje se.' },
            { title: 'Paropropustnost', desc: 'Materiál zůstává prodyšný, což brání vzniku plísní uvnitř.' },
            { title: 'Prodloužení životnosti', desc: 'Chrání materiály před mrazem, UV zářením a zvětráváním.' },
            { title: 'Snadná údržba', desc: 'Povrch se čistí sám při každém dešti.' }
        ],
        process: [
            { step: '01', title: 'Očištění', desc: 'Povrch musí být dokonale čistý, suchý a odmaštěný.' },
            { step: '02', title: 'Aplikace', desc: 'Nástřik nano impregnace speciální nízkotlakou metodou.' },
            { step: '03', title: 'Penetrace', desc: 'Zajištění rovnoměrného vsáknutí přípravku do pórů.' },
            { step: '04', title: 'Vytvrzení', desc: 'Ochrana dosáhne plné účinnosti po 24 hodinách.' }
        ],
        process_note: 'Aplikace na očištěný povrch rodinného domu trvá 1 den.',
    },
    'antislip': {
        title: 'Protiskluzová úprava',
        price_key: 'antislip',
        badge: 'BEZPEČNOST',
        subtitle: 'Chemická protiskluzová úprava mokrých povrchů bez změny vzhledu materiálu.',
        what_included: 'Aplikujeme protiskluzovou úpravu na dlažbu, mramor, žulu, PVC a linoleum. Vhodné pro okolí bazénů, koupelny, wellness centra, chodby, schodiště a komerční prostory. Zvyšuje bezpečnost za mokra.',
        benefits: [
            { title: 'Zvýšení přilnavosti', desc: 'Výrazně snižuje riziko uklouznutí na mokrém povrchu.' },
            { title: 'Bez změny vzhledu', desc: 'Úprava je okem neviditelná a nemění barvu ani lesk dlažby.' },
            { title: 'Dlouhá účinnost', desc: 'Ochranná protiskluzová vrstva vydrží několik let.' },
            { title: 'Splňuje normy', desc: 'Certifikované řešení splňující české i evropské normy.' }
        ],
        process: [
            { step: '01', title: 'Mytí', desc: 'Důkladné očištění a odmaštění podlahové plochy.' },
            { step: '02', title: 'Aplikace', desc: 'Nanesení protiskluzového roztoku na povrch.' },
            { step: '03', title: 'Reakce', desc: 'Kontrolované působení přípravku (mikroskopické zdrsnění).' },
            { step: '04', title: 'Oplach', desc: 'Neutralizace a oplach čistou vodou.' }
        ],
        process_note: 'Aplikaci v koupelně nebo u bazénu rodinného domu stihneme za 2 až 4 hodiny.',
    },
    'ceramfloor': {
        title: 'IG CeramFloor',
        price_key: 'ceramfloor',
        badge: 'PRŮMYSLOVÁ OCHRANA',
        subtitle: 'Vysoce odolná polymerní ochrana průmyslových podlah IG CeramFloor s protiskluzem.',
        what_included: 'Aplikujeme polymerní nátěrový systém IG CeramFloor na betonové a epoxidové podlahy v halách, skladech, potravinářských provozech a zemědělství. Nabízí extrémní chemickou a mechanickou odolnost.',
        benefits: [
            { title: 'Extrémní odolnost', desc: 'Odolává pojezdu vysokozdvižných vozíků a těžké techniky.' },
            { title: 'Chemická stálost', desc: 'Odolný vůči olejům, kyselinám, rozpouštědlům i dezinfekcím.' },
            { title: 'Rychlé vytvrzení', desc: 'Podlaha je plně zatížitelná již po 24 hodinách od aplikace.' },
            { title: 'Hygienická nezávadnost', desc: 'Vhodné i do potravinářských a zdravotnických provozů.' }
        ],
        process: [
            { step: '01', title: 'Broušení', desc: 'Mechanická příprava povrchu (broušení nebo tryskání).' },
            { step: '02', title: 'Opravy', desc: 'Sanace výtluků, prasklin a dilatací v betonu.' },
            { step: '03', title: 'Základ', desc: 'Aplikace penetrační a adhezní vrstvy.' },
            { step: '04', title: 'Nátěr', desc: 'Nanesení vysoce odolného systému IG CeramFloor.' }
        ],
        process_note: 'Doba realizace závisí na ploše, obvykle 1 až 3 pracovní dny.',
    },
    'antibac': {
        title: 'Antibakteriální ochrana',
        price_key: 'antibac',
        badge: 'HYGIENA',
        subtitle: 'Dlouhodobá dezinfekce a ochrana všech typů povrchů se samočistícím a antivirovým efektem.',
        what_included: 'Aplikujeme certifikovaný polymerní antibakteriální a antivirový přípravek IMPAGUARD GCA s účinností až 120 dní. Aktivně ničí viry, bakterie a plísně. Ideální pro zdravotnická zařízení, kanceláře, školy, školky a rodinné domy.',
        benefits: [
            { title: 'Účinnost až 120 dní', desc: 'Dlouhodobá aktivní ochrana povrchů proti virům a bakteriím.' },
            { title: 'Antibakteriální i antivirová', desc: 'Certifikovaná chemie ničící patogeny včetně obalených virů.' },
            { title: 'Vysoká zátěž', desc: 'Vhodné pro často dotýkané plochy (kliky, stoly, zábradlí).' },
            { title: 'Bezpečné pro zdraví', desc: 'Přípravek je hypoalergenní a naprosto bezpečný pro člověka.' },
            { title: 'Neviditelná vrstva', desc: 'Nemění vzhled, omak ani lesk ošetřených materiálů.' }
        ],
        process: [
            { step: '01', title: 'Posouzení', desc: 'Vyšetříme stav povrchů a navrhneme optimální pokrytí.' },
            { step: '02', title: 'Příprava', desc: 'Důkladné očištění a odmaštění ploch před aplikací.' },
            { step: '03', title: 'Aplikace', desc: 'Nástřik aktivního dezinfekčního nano-přípravku IMPAGUARD.' },
            { step: '04', title: 'Zaschnutí', desc: 'Vytvoření stabilní, dlouhodobě aktivní ochranné vrstvy během minut.' }
        ],
        process_note: 'Aplikaci v rodinném domě nebo menší kanceláři stihneme za 2 až 4 hodiny.',
    }
};

// Všech 12 služeb má teď v DB český slug (services.slug), ale tenhle
// katalog byl psaný pod původními anglickými klíči - bez aliasů by každá
// služba tiše přišla o fallback texty/galerii/benefity, stejně jako to
// dřív chybělo jen u cisteni-fasad a natery-fasad.
localCatalog['natery-fasad'] = localCatalog['facade-paint'];
localCatalog['cisteni-strech'] = localCatalog['roof'];
localCatalog['cisteni-dlazby'] = localCatalog['pavement'];
localCatalog['cisteni-fotovoltaiky'] = localCatalog['pv'];
localCatalog['odstraneni-graffiti'] = localCatalog['graffiti'];
localCatalog['prumyslove-cisteni'] = localCatalog['industrial'];
localCatalog['natery-strech'] = localCatalog['roof-paint'];
localCatalog['nano-impregnace'] = localCatalog['impregnation'];
localCatalog['protiskluzove-natery'] = localCatalog['antislip'];
localCatalog['ochrana-podlah-ceramfloor'] = localCatalog['ceramfloor'];
localCatalog['antibakterialni-ochrana'] = localCatalog['antibac'];
