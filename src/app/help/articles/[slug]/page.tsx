// src/app/help/articles/[slug]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, Button } from '@/components/ui';
import { ArrowLeft, ArrowRight, HelpCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Metadata } from 'next';

// Help article content database
const helpArticles: Record<string, {
  title: string;
  description: string;
  category: string;
  content: Array<{ heading?: string; text: string }>;
  relatedArticles?: string[];
}> = {
  'post-job': {
    title: 'Hoe plaats ik een klus?',
    description: 'Stap-voor-stap uitleg over het plaatsen van een klus op VakSpot.',
    category: 'Voor opdrachtgevers',
    content: [
      {
        text: 'Het plaatsen van een klus op VakSpot is eenvoudig en gratis. Volg deze stappen om uw klus te plaatsen en offertes te ontvangen van gekwalificeerde vakmensen.',
      },
      {
        heading: 'Stap 1: Maak een account aan',
        text: 'Als u nog geen account heeft, klik dan op "Registreren" rechtsboven op de pagina. Vul uw naam, e-mailadres en een wachtwoord in. Kies voor "Opdrachtgever" als accounttype.',
      },
      {
        heading: 'Stap 2: Start een nieuwe klus',
        text: 'Na het inloggen klikt u op "Klus plaatsen" in het menu. U wordt doorgeleid naar het klusformulier.',
      },
      {
        heading: 'Stap 3: Beschrijf uw klus',
        text: 'Geef uw klus een duidelijke titel en beschrijving. Hoe specifieker u bent, hoe beter vakmensen kunnen inschatten of zij u kunnen helpen. Vermeld belangrijke details zoals afmetingen, materialen, of specifieke wensen.',
      },
      {
        heading: 'Stap 4: Kies een categorie',
        text: 'Selecteer de categorie die het beste past bij uw klus. Dit helpt vakmensen om uw klus te vinden.',
      },
      {
        heading: 'Stap 5: Locatie en timing',
        text: 'Vul uw postcode in zodat vakmensen in uw buurt uw klus kunnen zien. Geef ook aan wanneer u de klus wilt laten uitvoeren.',
      },
      {
        heading: 'Stap 6: Voeg foto\'s toe (optioneel)',
        text: 'Foto\'s geven vakmensen een beter beeld van de situatie. Upload indien mogelijk foto\'s van de huidige situatie of van voorbeelden van wat u wilt.',
      },
      {
        heading: 'Stap 7: Publiceer uw klus',
        text: 'Controleer uw gegevens en klik op "Publiceren". Uw klus is nu zichtbaar voor vakmensen in uw regio.',
      },
      {
        heading: 'Wat gebeurt er daarna?',
        text: 'Vakmensen kunnen nu reageren op uw klus met een offerte. U ontvangt een e-mail wanneer er nieuwe offertes binnenkomen. Vergelijk de offertes en kies de vakman die het beste bij uw wensen past.',
      },
    ],
    relatedArticles: ['choose-pro', 'pricing-clients', 'get-quotes'],
  },
  'choose-pro': {
    title: 'Hoe kies ik de juiste vakman?',
    description: 'Tips voor het kiezen van de beste vakman voor uw klus.',
    category: 'Voor opdrachtgevers',
    content: [
      {
        text: 'Het kiezen van de juiste vakman is belangrijk voor een succesvol project. Hier zijn tips om de beste keuze te maken.',
      },
      {
        heading: 'Vergelijk meerdere offertes',
        text: 'Vraag altijd meerdere offertes aan. Zo krijgt u een goed beeld van de marktprijs en kunt u verschillende aanpakken vergelijken. Let niet alleen op de prijs, maar ook op wat er in de offerte is inbegrepen.',
      },
      {
        heading: 'Bekijk het profiel en reviews',
        text: 'Controleer het profiel van de vakman. Kijk naar hun ervaring, specialisaties en beoordelingen van eerdere klanten. Een vakman met goede reviews is vaak een veilige keuze.',
      },
      {
        heading: 'Check de verificatiestatus',
        text: 'Geverifieerde vakmensen hebben hun bedrijfsgegevens laten controleren door VakSpot. Dit biedt extra zekerheid over hun legitimiteit.',
      },
      {
        heading: 'Communiceer vooraf',
        text: 'Stuur een bericht naar de vakman met eventuele vragen. Dit geeft u een indruk van hun communicatie en professionaliteit. Een goede vakman reageert snel en duidelijk.',
      },
      {
        heading: 'Vraag naar garanties',
        text: 'Informeer naar garanties op het uitgevoerde werk. Professionele vakmensen bieden vaak garantie op hun werkzaamheden.',
      },
      {
        heading: 'Let op de details in de offerte',
        text: 'Een goede offerte is gedetailleerd en specifiek. Let op: materiaalkosten, arbeidskosten, geschatte tijdsduur, BTW, en eventuele bijkomende kosten.',
      },
    ],
    relatedArticles: ['post-job', 'pricing-clients', 'complaints'],
  },
  'pricing-clients': {
    title: 'Wat kost het gebruik van VakSpot?',
    description: 'Overzicht van de kosten voor opdrachtgevers.',
    category: 'Voor opdrachtgevers',
    content: [
      {
        text: 'Goed nieuws: het gebruik van VakSpot is volledig gratis voor opdrachtgevers!',
      },
      {
        heading: 'Gratis klussen plaatsen',
        text: 'U kunt onbeperkt klussen plaatsen zonder kosten. Er zijn geen verborgen kosten of abonnementen.',
      },
      {
        heading: 'Gratis offertes ontvangen',
        text: 'Het ontvangen van offertes van vakmensen is ook gratis. U betaalt pas wanneer u besluit een vakman in te huren voor de klus zelf.',
      },
      {
        heading: 'Gratis berichten sturen',
        text: 'Communicatie met vakmensen via ons berichtensysteem is gratis. Stel vragen, bespreek details, en maak afspraken zonder kosten.',
      },
      {
        heading: 'Wanneer betaalt u?',
        text: 'U betaalt alleen de vakman die u inhuurt voor het uitvoeren van de klus. De prijs wordt bepaald door de offerte die u accepteert. VakSpot brengt geen extra kosten in rekening.',
      },
      {
        heading: 'Hoe verdient VakSpot geld?',
        text: 'VakSpot verdient geld door kosten in rekening te brengen bij vakmensen voor het bekijken en reageren op leads. Zo blijft het platform gratis voor opdrachtgevers.',
      },
    ],
    relatedArticles: ['post-job', 'choose-pro', 'get-quotes'],
  },
  'cancel-job': {
    title: 'Hoe annuleer ik een klus?',
    description: 'Instructies voor het annuleren van een geplaatste klus.',
    category: 'Voor opdrachtgevers',
    content: [
      {
        text: 'Soms veranderen plannen en wilt u een klus annuleren. Hier leest u hoe dat werkt.',
      },
      {
        heading: 'Klus annuleren voordat u een offerte accepteert',
        text: 'Zolang u nog geen offerte heeft geaccepteerd, kunt u de klus eenvoudig annuleren. Ga naar "Mijn klussen" in uw dashboard, selecteer de klus, en klik op "Klus annuleren".',
      },
      {
        heading: 'Klus annuleren na acceptatie van een offerte',
        text: 'Als u al een offerte heeft geaccepteerd, neem dan eerst contact op met de vakman om de situatie te bespreken. In sommige gevallen kunnen er annuleringskosten van toepassing zijn, afhankelijk van de afspraken met de vakman.',
      },
      {
        heading: 'Communiceer duidelijk',
        text: 'Het is belangrijk om de vakman zo snel mogelijk te informeren over de annulering. Duidelijke communicatie voorkomt misverstanden en mogelijke kosten.',
      },
      {
        heading: 'Wat gebeurt er met ontvangen offertes?',
        text: 'Wanneer u een klus annuleert, worden alle ontvangen offertes automatisch geannuleerd. De vakmensen ontvangen hiervan een melding.',
      },
    ],
    relatedArticles: ['post-job', 'complaints'],
  },
  'register-pro': {
    title: 'Hoe meld ik mij aan als vakman?',
    description: 'Stap-voor-stap handleiding voor registratie als vakman.',
    category: 'Voor vakmensen',
    content: [
      {
        text: 'Word lid van VakSpot en ontvang leads van klanten in uw regio. De registratie is eenvoudig.',
      },
      {
        heading: 'Stap 1: Start de registratie',
        text: 'Klik op "Registreren" en kies voor "Vakman/bedrijf". Vul uw naam, e-mailadres en wachtwoord in.',
      },
      {
        heading: 'Stap 2: Vul uw bedrijfsgegevens in',
        text: 'Voer uw bedrijfsnaam, KvK-nummer, telefoonnummer en vestigingsplaats in. Deze gegevens zijn nodig voor verificatie.',
      },
      {
        heading: 'Stap 3: Kies uw specialisaties',
        text: 'Selecteer de categorieën waarin u werkzaam bent. Hierdoor ontvangt u alleen relevante leads.',
      },
      {
        heading: 'Stap 4: Stel uw werkgebied in',
        text: 'Geef aan binnen welke straal van uw vestigingsplaats u wilt werken. U ontvangt alleen leads binnen dit gebied.',
      },
      {
        heading: 'Stap 5: Maak uw profiel compleet',
        text: 'Voeg een profielfoto toe en schrijf een aantrekkelijke bio. Een compleet profiel vergroot uw kans op opdrachten.',
      },
      {
        heading: 'Verificatie',
        text: 'Na registratie wordt uw bedrijf geverifieerd door ons team. Dit duurt meestal 1-2 werkdagen. Na verificatie ontvangt u een verificatiebadge op uw profiel.',
      },
    ],
    relatedArticles: ['respond-leads', 'pricing-pros', 'improve-profile'],
  },
  'respond-leads': {
    title: 'Hoe reageer ik op leads?',
    description: 'Tips voor het succesvol reageren op klusaanvragen.',
    category: 'Voor vakmensen',
    content: [
      {
        text: 'Leads zijn klusaanvragen van potentiële klanten. Een goede reactie vergroot uw kans op de opdracht.',
      },
      {
        heading: 'Bekijk de lead details',
        text: 'Lees de klusbeschrijving zorgvuldig door. Let op de locatie, gewenste timing, en eventuele foto\'s. Zorg dat u de klus goed begrijpt voordat u reageert.',
      },
      {
        heading: 'Reageer snel',
        text: 'Snelheid is belangrijk. Klanten vergelijken vaak de eerste paar offertes die binnenkomen. Probeer binnen een paar uur te reageren.',
      },
      {
        heading: 'Schrijf een persoonlijke offerte',
        text: 'Vermijd standaard teksten. Verwijs naar specifieke details uit de klusbeschrijving. Dit toont dat u de vraag goed heeft gelezen.',
      },
      {
        heading: 'Wees duidelijk over de prijs',
        text: 'Geef een realistische prijsindicatie. Als de prijs afhankelijk is van factoren die u nog niet kent, geef dan een prijsrange en leg uit waarvan het afhangt.',
      },
      {
        heading: 'Toon uw expertise',
        text: 'Verwijs naar relevante ervaring of eerdere projecten. Dit geeft de klant vertrouwen in uw vakmanschap.',
      },
      {
        heading: 'Stel vragen indien nodig',
        text: 'Als er informatie ontbreekt, stel dan gerichte vragen via het berichtensysteem. Dit toont uw professionaliteit.',
      },
    ],
    relatedArticles: ['register-pro', 'pricing-pros', 'improve-profile'],
  },
  'pricing-pros': {
    title: 'Wat zijn de kosten voor vakmensen?',
    description: 'Overzicht van de kosten en tarieven voor vakmensen.',
    category: 'Voor vakmensen',
    content: [
      {
        text: 'VakSpot hanteert een eerlijk en transparant kostenmodel voor vakmensen.',
      },
      {
        heading: 'Gratis registratie',
        text: 'Het aanmaken van een account en profiel is volledig gratis. U betaalt pas wanneer u wilt reageren op een lead.',
      },
      {
        heading: 'Kosten per lead',
        text: 'Om op een lead te reageren betaalt u een vast bedrag. De exacte prijs hangt af van de categorie en omvang van de klus. U ziet de kosten voordat u reageert.',
      },
      {
        heading: 'Geen maandelijkse kosten',
        text: 'Er zijn geen abonnementskosten of verplichtingen. U bepaalt zelf wanneer en op welke leads u reageert.',
      },
      {
        heading: 'Betaal alleen voor kwaliteitsleads',
        text: 'Wij controleren alle klussen voordat ze worden gepubliceerd. Zo ontvangt u alleen serieuze aanvragen van echte klanten.',
      },
      {
        heading: 'Tegoed systeem',
        text: 'U kunt tegoed kopen dat u kunt gebruiken om op leads te reageren. Hoe meer tegoed u in één keer koopt, hoe voordeliger het is.',
      },
    ],
    relatedArticles: ['register-pro', 'respond-leads'],
  },
  'improve-profile': {
    title: 'Hoe verbeter ik mijn profiel?',
    description: 'Tips om uw profiel aantrekkelijker te maken voor klanten.',
    category: 'Voor vakmensen',
    content: [
      {
        text: 'Een sterk profiel helpt u om meer opdrachten te krijgen. Hier zijn tips om uw profiel te optimaliseren.',
      },
      {
        heading: 'Voeg een professionele foto toe',
        text: 'Een foto van uzelf of uw team maakt uw profiel persoonlijker. Kies een duidelijke, professionele foto.',
      },
      {
        heading: 'Schrijf een overtuigende bio',
        text: 'Vertel wie u bent, wat uw specialisaties zijn, en wat u onderscheidt van anderen. Wees specifiek over uw ervaring en kwaliteiten.',
      },
      {
        heading: 'Toon uw werk',
        text: 'Voeg foto\'s toe van uitgevoerde projecten. Visueel bewijs van uw vakmanschap overtuigt potentiële klanten.',
      },
      {
        heading: 'Vraag om reviews',
        text: 'Goede beoordelingen zijn goud waard. Vraag tevreden klanten om een review achter te laten. Meer en betere reviews verhogen uw geloofwaardigheid.',
      },
      {
        heading: 'Houd uw gegevens up-to-date',
        text: 'Zorg dat uw contactgegevens, werkgebied en specialisaties actueel zijn. Verouderde informatie kan leiden tot gemiste kansen.',
      },
      {
        heading: 'Word geverifieerd',
        text: 'Een verificatiebadge geeft klanten extra vertrouwen. Zorg dat uw bedrijfsgegevens correct zijn ingevuld zodat u geverifieerd kunt worden.',
      },
    ],
    relatedArticles: ['register-pro', 'respond-leads', 'pro-verification'],
  },
  'change-password': {
    title: 'Hoe wijzig ik mijn wachtwoord?',
    description: 'Instructies voor het wijzigen van uw wachtwoord.',
    category: 'Account & betalingen',
    content: [
      {
        text: 'Het is aan te raden om regelmatig uw wachtwoord te wijzigen voor optimale beveiliging.',
      },
      {
        heading: 'Wachtwoord wijzigen',
        text: 'Ga naar "Instellingen" in uw accountmenu. Onder "Beveiliging" vindt u de optie "Wachtwoord wijzigen". Vul uw huidige wachtwoord in, gevolgd door uw nieuwe wachtwoord.',
      },
      {
        heading: 'Wachtwoord vergeten?',
        text: 'Klik op de inlogpagina op "Wachtwoord vergeten". Vul uw e-mailadres in en u ontvangt een link om uw wachtwoord te resetten.',
      },
      {
        heading: 'Tips voor een sterk wachtwoord',
        text: 'Gebruik minimaal 8 tekens, inclusief hoofdletters, kleine letters, cijfers en speciale tekens. Gebruik geen voor de hand liggende woorden of persoonlijke informatie.',
      },
    ],
    relatedArticles: ['change-email', 'delete-account'],
  },
  'change-email': {
    title: 'Hoe wijzig ik mijn e-mailadres?',
    description: 'Instructies voor het wijzigen van uw e-mailadres.',
    category: 'Account & betalingen',
    content: [
      {
        text: 'Uw e-mailadres is belangrijk voor communicatie en het inloggen op uw account.',
      },
      {
        heading: 'E-mailadres wijzigen',
        text: 'Ga naar "Profiel bewerken" in uw accountmenu. Vul uw nieuwe e-mailadres in bij het veld "E-mailadres" en sla de wijzigingen op.',
      },
      {
        heading: 'Verificatie vereist',
        text: 'Na het wijzigen van uw e-mailadres moet u het nieuwe adres verifiëren. U ontvangt een verificatie-e-mail op uw nieuwe adres.',
      },
      {
        heading: 'Inloggen na wijziging',
        text: 'Na verificatie kunt u inloggen met uw nieuwe e-mailadres. Uw oude e-mailadres werkt niet meer voor inloggen.',
      },
    ],
    relatedArticles: ['change-password', 'delete-account'],
  },
  'delete-account': {
    title: 'Hoe verwijder ik mijn account?',
    description: 'Instructies voor het definitief verwijderen van uw account.',
    category: 'Account & betalingen',
    content: [
      {
        text: 'We vinden het jammer als u vertrekt, maar u kunt uw account op elk moment verwijderen.',
      },
      {
        heading: 'Voordat u verwijdert',
        text: 'Let op: het verwijderen van uw account is definitief. Al uw gegevens, klussen, offertes en berichten worden permanent verwijderd en kunnen niet worden hersteld.',
      },
      {
        heading: 'Account verwijderen',
        text: 'Ga naar "Instellingen" in uw accountmenu. Scroll naar beneden naar "Account verwijderen". Bevestig uw keuze door uw wachtwoord in te voeren.',
      },
      {
        heading: 'Na verwijdering',
        text: 'U ontvangt een bevestigingsmail. Uw gegevens worden binnen 30 dagen permanent verwijderd uit onze systemen.',
      },
      {
        heading: 'Openstaande verplichtingen',
        text: 'Als u openstaande betalingen of actieve klussen heeft, moet u deze eerst afronden voordat u uw account kunt verwijderen.',
      },
    ],
    relatedArticles: ['change-password', 'change-email'],
  },
  'payment-methods': {
    title: 'Betalingsmethodes',
    description: 'Overzicht van beschikbare betalingsmethodes.',
    category: 'Account & betalingen',
    content: [
      {
        text: 'VakSpot ondersteunt diverse betalingsmethodes voor uw gemak.',
      },
      {
        heading: 'iDEAL',
        text: 'De populairste betalingsmethode in Nederland. Betaal veilig en direct via uw eigen bank.',
      },
      {
        heading: 'Creditcard',
        text: 'We accepteren Visa, Mastercard en American Express. Uw gegevens worden veilig verwerkt.',
      },
      {
        heading: 'PayPal',
        text: 'Betaal snel en veilig met uw PayPal-account.',
      },
      {
        heading: 'Bancontact',
        text: 'Voor onze Belgische gebruikers ondersteunen we ook Bancontact.',
      },
      {
        heading: 'Veiligheid',
        text: 'Alle betalingen worden verwerkt via beveiligde verbindingen. We slaan geen creditcardgegevens op onze servers op.',
      },
    ],
    relatedArticles: ['pricing-clients', 'pricing-pros'],
  },
  'data-protection': {
    title: 'Hoe beschermt VakSpot mijn gegevens?',
    description: 'Informatie over hoe wij uw privacy beschermen.',
    category: 'Veiligheid & privacy',
    content: [
      {
        text: 'Bij VakSpot nemen we uw privacy serieus. Hier leest u hoe wij uw gegevens beschermen.',
      },
      {
        heading: 'Versleuteling',
        text: 'Al uw gegevens worden versleuteld opgeslagen en verzonden. We gebruiken SSL/TLS-encryptie voor alle communicatie.',
      },
      {
        heading: 'Beperkte toegang',
        text: 'Alleen geautoriseerde medewerkers hebben toegang tot persoonsgegevens, en alleen wanneer dit noodzakelijk is.',
      },
      {
        heading: 'Geen verkoop van gegevens',
        text: 'Wij verkopen uw persoonsgegevens nooit aan derden. Uw gegevens worden alleen gebruikt voor het leveren van onze diensten.',
      },
      {
        heading: 'AVG-compliant',
        text: 'VakSpot voldoet aan de Algemene Verordening Gegevensbescherming (AVG/GDPR). U heeft recht op inzage, correctie en verwijdering van uw gegevens.',
      },
      {
        heading: 'Meer informatie',
        text: 'Lees ons volledige privacybeleid voor gedetailleerde informatie over gegevensverwerking.',
      },
    ],
    relatedArticles: ['safe-contact', 'report-abuse'],
  },
  'safe-contact': {
    title: 'Tips voor veilig contact',
    description: 'Hoe u veilig communiceert via VakSpot.',
    category: 'Veiligheid & privacy',
    content: [
      {
        text: 'Volg deze tips voor veilige communicatie en transacties via VakSpot.',
      },
      {
        heading: 'Communiceer via het platform',
        text: 'Gebruik het berichtensysteem van VakSpot voor communicatie. Zo hebben we een overzicht van alle afspraken en kunnen we helpen bij geschillen.',
      },
      {
        heading: 'Controleer profielen',
        text: 'Bekijk het profiel en de reviews van de andere partij voordat u afspraken maakt. Een geverifieerd profiel biedt extra zekerheid.',
      },
      {
        heading: 'Maak duidelijke afspraken',
        text: 'Leg afspraken over prijs, timing en werkzaamheden schriftelijk vast via het berichtensysteem.',
      },
      {
        heading: 'Betaal niet vooruit',
        text: 'Betaal nooit het volledige bedrag vooruit. Een aanbetaling van maximaal 30% is gebruikelijk voor materiaalkosten.',
      },
      {
        heading: 'Vertrouw uw gevoel',
        text: 'Voelt iets niet goed? Vertrouw op uw intuïtie. Bij twijfel kunt u altijd contact opnemen met onze klantenservice.',
      },
    ],
    relatedArticles: ['report-abuse', 'data-protection'],
  },
  'report-abuse': {
    title: 'Meld verdacht gedrag',
    description: 'Hoe u misbruik of verdacht gedrag kunt melden.',
    category: 'Veiligheid & privacy',
    content: [
      {
        text: 'Help ons VakSpot veilig te houden door verdacht gedrag te melden.',
      },
      {
        heading: 'Wat kunt u melden?',
        text: 'U kunt meldingen maken over: fraude of oplichting, ongepaste berichten, nep-profielen, spam, of ander misbruik van het platform.',
      },
      {
        heading: 'Hoe meldt u?',
        text: 'Klik op de "Melden" knop op het profiel, de klus of in het berichtenvenster. Beschrijf wat er aan de hand is en voeg eventueel bewijs toe.',
      },
      {
        heading: 'Wat doen wij met meldingen?',
        text: 'Ons team onderzoekt alle meldingen binnen 24 uur. Afhankelijk van de ernst kan dit leiden tot waarschuwingen of permanente verwijdering van accounts.',
      },
      {
        heading: 'Anonimiteit',
        text: 'Uw melding wordt vertrouwelijk behandeld. De gemelde partij krijgt niet te zien wie de melding heeft gedaan.',
      },
      {
        heading: 'Dringende zaken',
        text: 'Bij crimineel gedrag adviseren wij u om ook contact op te nemen met de politie.',
      },
    ],
    relatedArticles: ['safe-contact', 'data-protection'],
  },
  'pro-verification': {
    title: 'Verificatie van vakmensen',
    description: 'Uitleg over het verificatieproces voor vakmensen.',
    category: 'Veiligheid & privacy',
    content: [
      {
        text: 'Verificatie geeft opdrachtgevers vertrouwen in de legitimiteit van vakmensen.',
      },
      {
        heading: 'Wat wordt gecontroleerd?',
        text: 'Bij verificatie controleren wij: de geldigheid van het KvK-nummer, de bedrijfsnaam en vestigingsplaats, en of het bedrijf actief is.',
      },
      {
        heading: 'Het verificatiebadge',
        text: 'Geverifieerde vakmensen krijgen een groen vinkje op hun profiel. Dit toont opdrachtgevers dat het bedrijf is gecontroleerd.',
      },
      {
        heading: 'Verificatie aanvragen',
        text: 'Verificatie gebeurt automatisch na registratie. Zorg dat uw KvK-nummer correct is ingevuld. De controle duurt meestal 1-2 werkdagen.',
      },
      {
        heading: 'Geen garantie',
        text: 'Let op: verificatie bevestigt alleen de bedrijfsregistratie. Het is geen garantie voor de kwaliteit van het werk. Bekijk altijd ook reviews en portfolios.',
      },
    ],
    relatedArticles: ['register-pro', 'improve-profile', 'choose-pro'],
  },
  'get-quotes': {
    title: 'Hoe krijg ik goede offertes?',
    description: 'Tips om betere offertes te ontvangen van vakmensen.',
    category: 'Voor opdrachtgevers',
    content: [
      {
        text: 'De kwaliteit van de offertes die u ontvangt hangt af van hoe goed u uw klus beschrijft.',
      },
      {
        heading: 'Wees specifiek',
        text: 'Hoe meer details u geeft, hoe nauwkeuriger de offertes. Vermeld afmetingen, materialen, en specifieke wensen.',
      },
      {
        heading: 'Voeg foto\'s toe',
        text: 'Een foto zegt meer dan duizend woorden. Upload foto\'s van de huidige situatie en eventueel voorbeelden van het gewenste resultaat.',
      },
      {
        heading: 'Geef uw budget aan',
        text: 'Als u een budget in gedachten heeft, vermeld dit dan. Vakmensen kunnen dan beter inschatten of zij aan uw verwachtingen kunnen voldoen.',
      },
      {
        heading: 'Reageer op vragen',
        text: 'Als vakmensen aanvullende vragen stellen, beantwoord deze dan snel en volledig. Dit helpt hen om een betere offerte te maken.',
      },
      {
        heading: 'Kies de juiste categorie',
        text: 'Zorg dat u de juiste categorie selecteert zodat de relevante vakmensen uw klus kunnen vinden.',
      },
    ],
    relatedArticles: ['post-job', 'choose-pro', 'pricing-clients'],
  },
  'complaints': {
    title: 'Wat als ik niet tevreden ben?',
    description: 'Hoe u een klacht kunt indienen of een geschil kunt oplossen.',
    category: 'Voor opdrachtgevers',
    content: [
      {
        text: 'Het kan voorkomen dat u niet tevreden bent over een vakman. Hier leest u wat u kunt doen.',
      },
      {
        heading: 'Communiceer eerst met de vakman',
        text: 'Bespreek uw onvrede eerst met de vakman zelf. Vaak kunnen problemen in onderling overleg worden opgelost. Doe dit bij voorkeur schriftelijk via ons berichtensysteem.',
      },
      {
        heading: 'Documenteer alles',
        text: 'Maak foto\'s van problemen en bewaar alle communicatie. Dit is belangrijk als het tot een geschil komt.',
      },
      {
        heading: 'Laat een eerlijke review achter',
        text: 'Uw ervaring helpt andere opdrachtgevers. Laat een eerlijke en feitelijke review achter op het profiel van de vakman.',
      },
      {
        heading: 'Neem contact op met VakSpot',
        text: 'Komt u er samen niet uit? Neem dan contact op met onze klantenservice. Wij kunnen bemiddelen en advies geven.',
      },
      {
        heading: 'Externe hulp',
        text: 'Bij ernstige geschillen kunt u contact opnemen met brancheorganisaties of juridische instanties zoals de Geschillencommissie.',
      },
    ],
    relatedArticles: ['choose-pro', 'report-abuse', 'safe-contact'],
  },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = helpArticles[slug];
  
  if (!article) {
    return { title: 'Artikel niet gevonden' };
  }
  
  return {
    title: article.title,
    description: article.description,
  };
}

export async function generateStaticParams() {
  return Object.keys(helpArticles).map((slug) => ({ slug }));
}

export default async function HelpArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = helpArticles[slug];
  
  if (!article) {
    notFound();
  }

  const relatedArticles = article.relatedArticles
    ?.map(key => helpArticles[key] ? { slug: key, ...helpArticles[key] } : null)
    .filter(Boolean) || [];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-surface-50 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/help"
            className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar Help Center
          </Link>
          <div className="flex items-center gap-2 text-sm text-brand-600 mb-3">
            <HelpCircle className="h-4 w-4" />
            {article.category}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-surface-900 sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-4 text-lg text-surface-600">
            {article.description}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Card className="mb-8">
            <div className="space-y-6">
              {article.content.map((section, index) => (
                <div key={index}>
                  {section.heading && (
                    <h2 className="text-lg font-semibold text-surface-900 mb-2">
                      {section.heading}
                    </h2>
                  )}
                  <p className="text-surface-600 leading-relaxed whitespace-pre-line">
                    {section.text}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Feedback */}
          <Card className="mb-8 bg-surface-50">
            <div className="text-center">
              <p className="text-surface-700 font-medium mb-3">Was dit artikel nuttig?</p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" size="sm" leftIcon={<ThumbsUp className="h-4 w-4" />}>
                  Ja, bedankt
                </Button>
                <Button variant="outline" size="sm" leftIcon={<ThumbsDown className="h-4 w-4" />}>
                  Kan beter
                </Button>
              </div>
            </div>
          </Card>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-surface-900 mb-4">
                Gerelateerde artikelen
              </h3>
              <div className="space-y-3">
                {relatedArticles.map((related) => (
                  <Link
                    key={related!.slug}
                    href={`/help/articles/${related!.slug}`}
                    className="flex items-center justify-between p-4 rounded-xl border border-surface-200 hover:border-brand-300 hover:bg-brand-50/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-surface-900">{related!.title}</p>
                      <p className="text-sm text-surface-500">{related!.category}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-surface-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Contact CTA */}
          <div className="mt-12 text-center border-t border-surface-200 pt-8">
            <p className="text-surface-600 mb-4">
              Heeft u nog vragen? Neem contact met ons op.
            </p>
            <Link href="/contact">
              <Button>Contact opnemen</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
