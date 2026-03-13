import type { Destination, Review, Article } from "../types";

export const mockDestinations: Destination[] = [
  {
    id: "1",
    name: "Ibiza",
    slug: "ibiza",
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=80&auto=format",
    description: "Party and paradise in the Balearic Islands",
    boatCount: 342,
  },
  {
    id: "2",
    name: "Santorini",
    slug: "santorini",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600&q=80&auto=format",
    description: "Iconic sunsets and volcanic waters",
    boatCount: 187,
  },
  {
    id: "3",
    name: "Dubrovnik",
    slug: "dubrovnik",
    image: "https://images.unsplash.com/photo-1555990538-1e6c53b44ce5?w=600&q=80&auto=format",
    description: "Crystal clear Adriatic coastline",
    boatCount: 156,
  },
  {
    id: "4",
    name: "Amalfi Coast",
    slug: "amalfi-coast",
    image: "https://images.unsplash.com/photo-1534008897995-27a23e859048?w=600&q=80&auto=format",
    description: "Italian coastal paradise",
    boatCount: 234,
  },
  {
    id: "5",
    name: "Mykonos",
    slug: "mykonos",
    image: "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=600&q=80&auto=format",
    description: "Windmills and turquoise waters",
    boatCount: 198,
  },
  {
    id: "6",
    name: "Côte d'Azur",
    slug: "cote-d-azur",
    image: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=600&q=80&auto=format",
    description: "The glamorous French Riviera",
    boatCount: 276,
  },
  {
    id: "7",
    name: "Sardinia",
    slug: "sardinia",
    image: "https://images.unsplash.com/photo-1586105449897-20b5efeb3233?w=600&q=80&auto=format",
    description: "Hidden coves and emerald seas",
    boatCount: 145,
  },
  {
    id: "8",
    name: "Split",
    slug: "split",
    image: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=600&q=80&auto=format",
    description: "Gateway to Croatian islands",
    boatCount: 213,
  },
];

export const mockReviews: Review[] = [
  {
    id: "1",
    boatId: "b1",
    userId: "u1",
    userName: "Maria Santos",
    rating: 5,
    comment: "Absolutely incredible experience! The boat was in perfect condition and the skipper was so knowledgeable about the best spots.",
    boatName: "Sea Breeze 42",
    location: "Ibiza, Spain",
    createdAt: new Date("2025-09-15"),
  },
  {
    id: "2",
    boatId: "b2",
    userId: "u2",
    userName: "James Wilson",
    rating: 5,
    comment: "Best family holiday we've ever had. The kids loved it and the booking process was seamless.",
    boatName: "Ocean Dream",
    location: "Santorini, Greece",
    createdAt: new Date("2025-08-22"),
  },
  {
    id: "3",
    boatId: "b3",
    userId: "u3",
    userName: "Sophie Laurent",
    rating: 4,
    comment: "Beautiful catamaran, well-maintained. The only thing was pickup was a bit late, but otherwise perfect.",
    boatName: "Cat Paradise",
    location: "Côte d'Azur, France",
    createdAt: new Date("2025-10-01"),
  },
  {
    id: "4",
    boatId: "b4",
    userId: "u4",
    userName: "Marco Rossi",
    rating: 5,
    comment: "We sailed along the Amalfi coast for 3 days. Unforgettable sunsets and hidden beaches. Highly recommend!",
    boatName: "Bella Vista",
    location: "Amalfi, Italy",
    createdAt: new Date("2025-07-10"),
  },
  {
    id: "5",
    boatId: "b5",
    userId: "u5",
    userName: "Elena Popov",
    rating: 5,
    comment: "Third time booking through TapYourBoat. Consistently great service and beautiful boats. My go-to platform.",
    boatName: "Adriatic Star",
    location: "Dubrovnik, Croatia",
    createdAt: new Date("2025-11-05"),
  },
  {
    id: "6",
    boatId: "b6",
    userId: "u6",
    userName: "Tom Anderson",
    rating: 4,
    comment: "Great motor yacht for a day trip. Clean, well-equipped, and the owner was very responsive.",
    boatName: "Speed King",
    location: "Mykonos, Greece",
    createdAt: new Date("2025-08-30"),
  },
];

export const mockArticles: Article[] = [
  {
    id: "1",
    title: {
      en: "Top 10 Sailing Destinations in the Mediterranean for 2026",
      el: "Οι 10 Κορυφαίοι Προορισμοί Ιστιοπλοΐας στη Μεσόγειο για το 2026",
    },
    slug: "top-10-sailing-destinations-mediterranean-2026",
    image: "https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=600&q=80&auto=format",
    summary: {
      en: "Discover the most breathtaking Mediterranean sailing routes, from hidden Greek coves to the stunning Croatian coastline.",
      el: "Ανακαλύψτε τις πιο εντυπωσιακές διαδρομές ιστιοπλοΐας στη Μεσόγειο, από κρυφούς ελληνικούς όρμους μέχρι την εκπληκτική κροατική ακτογραμμή.",
    },
    content: {
      en: `<h2>The Mediterranean's Finest Sailing Waters</h2>
<p>The Mediterranean remains the world's premier sailing destination, offering a perfect blend of warm waters, reliable winds, and centuries-old coastal towns. Here are the top 10 destinations for 2026.</p>

<h3>1. Cyclades, Greece</h3>
<p>Island-hopping through the Cyclades is a bucket-list experience. From the iconic whitewashed villages of Santorini to the vibrant nightlife of Mykonos, each island offers a unique character. The Meltemi winds from June to September provide exhilarating sailing conditions.</p>

<h3>2. Croatian Coastline</h3>
<p>With over a thousand islands, Croatia offers endless anchorages and crystal-clear waters. Split and Dubrovnik are perfect starting points, and the Kornati National Park is a sailor's paradise with its rugged, uninhabited islands.</p>

<h3>3. Amalfi Coast, Italy</h3>
<p>Dramatic cliffs, pastel-coloured villages, and world-class cuisine make the Amalfi Coast unforgettable. Sail from Naples to Positano and stop at Capri for the famous Blue Grotto.</p>

<h3>4. Balearic Islands, Spain</h3>
<p>Mallorca, Menorca, Ibiza, and Formentera each have a distinct personality. From Ibiza's legendary beach clubs to Menorca's tranquil coves, there's something for every sailor.</p>

<h3>5. Sardinia &amp; Corsica</h3>
<p>The Strait of Bonifacio between Sardinia and Corsica offers some of the Mediterranean's most dramatic coastal scenery. The Costa Smeralda's emerald waters are simply stunning.</p>

<h3>6. Turkish Riviera</h3>
<p>Turkey's "Turquoise Coast" lives up to its name. Ancient ruins, pine-clad hills, and warm hospitality make this an increasingly popular sailing ground. Fethiye and Gocek are excellent bases.</p>

<h3>7. French Riviera</h3>
<p>From Saint-Tropez to Monaco, the Cote d'Azur oozes glamour. Anchor in the bay of Villefranche-sur-Mer or explore the Lerins Islands off Cannes for a quieter experience.</p>

<h3>8. Ionian Islands, Greece</h3>
<p>Gentler winds than the Aegean make the Ionian Islands ideal for less experienced sailors. Corfu, Kefalonia, and Zakynthos offer lush green landscapes and sheltered bays.</p>

<h3>9. Malta &amp; Gozo</h3>
<p>These small islands pack a punch with their ancient temples, vibrant harbours, and excellent diving. The short distances between anchorages make for relaxed day sailing.</p>

<h3>10. Montenegro</h3>
<p>The Bay of Kotor is one of Europe's most dramatic fjord-like inlets. Montenegro is still relatively undiscovered, offering great value and uncrowded waters.</p>

<h2>Planning Your Trip</h2>
<p>The best sailing season across the Mediterranean runs from May to October, with July and August being the busiest months. Consider shoulder seasons for fewer crowds and better prices. TapYourBoat has hundreds of boats available across all these destinations — start planning your 2026 adventure today.</p>`,
      el: `<h2>Τα Καλύτερα Νερά Ιστιοπλοΐας της Μεσογείου</h2>
<p>Η Μεσόγειος παραμένει ο κορυφαίος προορισμός ιστιοπλοΐας στον κόσμο, προσφέροντας τον τέλειο συνδυασμό ζεστών νερών, αξιόπιστων ανέμων και αιώνων παράκτιων πόλεων. Εδώ είναι οι 10 κορυφαίοι προορισμοί για το 2026.</p>

<h3>1. Κυκλάδες, Ελλάδα</h3>
<p>Το island-hopping στις Κυκλάδες είναι μια εμπειρία ζωής. Από τα εμβληματικά λευκά χωριά της Σαντορίνης μέχρι τη ζωντανή νυχτερινή ζωή της Μυκόνου, κάθε νησί προσφέρει μοναδικό χαρακτήρα. Οι μελτέμια από Ιούνιο ως Σεπτέμβριο δημιουργούν συναρπαστικές συνθήκες ιστιοπλοΐας.</p>

<h3>2. Κροατική Ακτογραμμή</h3>
<p>Με πάνω από χίλια νησιά, η Κροατία προσφέρει ατελείωτα αγκυροβόλια και κρυστάλλινα νερά. Το Σπλιτ και το Ντουμπρόβνικ είναι τέλεια σημεία εκκίνησης, και το Εθνικό Πάρκο Κορνάτι είναι παράδεισος για ιστιοπλόους.</p>

<h3>3. Ακτή Αμάλφι, Ιταλία</h3>
<p>Δραματικοί γκρεμοί, παστέλ χωριά και κουζίνα παγκόσμιας κλάσης κάνουν την Ακτή Αμάλφι αξέχαστη. Πλεύστε από τη Νάπολη στο Ποζιτάνο και σταματήστε στο Κάπρι για το περίφημο Μπλε Σπήλαιο.</p>

<h3>4. Βαλεαρίδες Νήσοι, Ισπανία</h3>
<p>Η Μαγιόρκα, η Μενόρκα, η Ίμπιζα και η Φορμεντέρα έχουν η κάθε μια ξεχωριστή προσωπικότητα. Από τα θρυλικά beach clubs της Ίμπιζα μέχρι τους ήσυχους όρμους της Μενόρκα, υπάρχει κάτι για κάθε ιστιοπλόο.</p>

<h3>5. Σαρδηνία &amp; Κορσική</h3>
<p>Τα Στενά του Μπονιφάτσιο μεταξύ Σαρδηνίας και Κορσικής προσφέρουν κάποια από τα πιο δραματικά παράκτια τοπία της Μεσογείου. Τα σμαραγδένια νερά της Κόστα Σμεράλντα είναι απλά εκπληκτικά.</p>

<h3>6. Τουρκική Ριβιέρα</h3>
<p>Η «Τιρκουάζ Ακτή» της Τουρκίας δικαιώνει το όνομά της. Αρχαία ερείπια, πευκόφυτοι λόφοι και θερμή φιλοξενία την κάνουν όλο και πιο δημοφιλή. Το Φετχιγιέ και το Γκιοτσέκ είναι εξαιρετικές βάσεις.</p>

<h3>7. Γαλλική Ριβιέρα</h3>
<p>Από το Σεν-Τροπέ μέχρι το Μονακό, η Κυανή Ακτή αποπνέει γοητεία. Αγκυροβολήστε στον κόλπο του Villefranche-sur-Mer ή εξερευνήστε τα νησιά Λεράν έξω από τις Κάννες.</p>

<h3>8. Ιόνια Νησιά, Ελλάδα</h3>
<p>Οι πιο ήπιοι άνεμοι σε σχέση με το Αιγαίο κάνουν τα Ιόνια Νησιά ιδανικά για λιγότερο έμπειρους ιστιοπλόους. Η Κέρκυρα, η Κεφαλονιά και η Ζάκυνθος προσφέρουν καταπράσινα τοπία και προστατευμένους κόλπους.</p>

<h3>9. Μάλτα &amp; Γκόζο</h3>
<p>Αυτά τα μικρά νησιά εντυπωσιάζουν με τους αρχαίους ναούς, τα ζωντανά λιμάνια και τις εξαιρετικές καταδύσεις. Οι μικρές αποστάσεις μεταξύ αγκυροβολίων κάνουν την ημερήσια ιστιοπλοΐα χαλαρή.</p>

<h3>10. Μαυροβούνιο</h3>
<p>Ο Κόλπος του Κότορ είναι ένας από τους πιο δραματικούς φιόρδ της Ευρώπης. Το Μαυροβούνιο παραμένει σχετικά ανεξερεύνητο, προσφέροντας εξαιρετική αξία και ήσυχα νερά.</p>

<h2>Σχεδιασμός του Ταξιδιού σας</h2>
<p>Η καλύτερη περίοδος ιστιοπλοΐας στη Μεσόγειο είναι από Μάιο ως Οκτώβριο, με Ιούλιο και Αύγουστο να είναι οι πιο πολυσύχναστοι μήνες. Σκεφτείτε τις μεταβατικές περιόδους για λιγότερο κόσμο και καλύτερες τιμές. Ξεκινήστε να σχεδιάζετε την περιπέτεια του 2026 σήμερα.</p>`,
    },
    createdAt: new Date("2026-02-20"),
  },
  {
    id: "2",
    title: {
      en: "First-Time Boat Renter? Everything You Need to Know",
      el: "Νοικιάζετε Σκάφος για Πρώτη Φορά; Όλα Όσα Πρέπει να Γνωρίζετε",
    },
    slug: "first-time-boat-renter-guide",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80&auto=format",
    summary: {
      en: "A comprehensive guide covering licenses, insurance, what to pack, and how to choose the right boat for your experience level.",
      el: "Ένας πλήρης οδηγός που καλύπτει άδειες, ασφάλιση, τι να πακετάρετε και πώς να επιλέξετε το σωστό σκάφος για το επίπεδο εμπειρίας σας.",
    },
    content: {
      en: `<h2>Your First Boat Rental: A Complete Guide</h2>
<p>Renting a boat for the first time can feel overwhelming, but with the right preparation it's easier than you think. This guide covers everything from choosing the right vessel to what to pack on board.</p>

<h3>Do You Need a Licence?</h3>
<p>Licence requirements vary by country and boat type. In many Mediterranean countries, boats under a certain engine power can be rented without a licence. However, for sailboats and larger vessels, you'll typically need at least a basic sailing certificate (such as RYA Day Skipper or ICC). If you don't have a licence, don't worry — you can always hire a skipper who will handle the boat while you enjoy the ride.</p>

<h3>Choosing the Right Boat</h3>
<p>Consider these factors when selecting your vessel:</p>
<ul>
<li><strong>Group size:</strong> Make sure the boat has enough capacity and sleeping berths for your party.</li>
<li><strong>Experience level:</strong> If you're a beginner, start with a motorboat or hire a skipper for a sailboat.</li>
<li><strong>Budget:</strong> Prices vary significantly by boat type, season, and location. Day rentals are more affordable than weekly charters.</li>
<li><strong>Activities:</strong> Want to water ski? You'll need a motorboat. Prefer a relaxing cruise? A catamaran offers the most comfort.</li>
</ul>

<h3>What's Usually Included</h3>
<p>Most boat rentals include basic safety equipment (life jackets, fire extinguisher, first aid kit), navigation instruments, and a dinghy. Some include fuel, while others charge separately. Always check the listing details carefully before booking.</p>

<h3>What to Pack</h3>
<p>Pack light and use soft bags instead of hard suitcases — they're much easier to store on board. Essentials include:</p>
<ul>
<li>Sunscreen (SPF 50+) and sunglasses</li>
<li>Non-slip shoes or deck shoes</li>
<li>Light layers for cooler evenings</li>
<li>Waterproof bag for electronics</li>
<li>Motion sickness medication if needed</li>
<li>Snorkelling gear (if not provided)</li>
</ul>

<h3>Insurance &amp; Security Deposit</h3>
<p>Most charter companies include basic insurance, but it's worth checking the excess amount. A security deposit (typically refundable) is standard and can range from a few hundred to several thousand euros depending on the boat's value. Consider purchasing additional damage waiver cover for peace of mind.</p>

<h3>Booking Tips</h3>
<ul>
<li><strong>Book early:</strong> Popular boats and peak-season dates sell out months in advance.</li>
<li><strong>Read reviews:</strong> Previous renters' experiences are invaluable.</li>
<li><strong>Communicate with the owner:</strong> Don't hesitate to ask questions before booking.</li>
<li><strong>Check cancellation policy:</strong> Look for flexible cancellation in case your plans change.</li>
</ul>

<p>Ready to set sail? Browse boats on TapYourBoat and find the perfect vessel for your first maritime adventure.</p>`,
      el: `<h2>Η Πρώτη σας Ενοικίαση Σκάφους: Πλήρης Οδηγός</h2>
<p>Η ενοικίαση σκάφους για πρώτη φορά μπορεί να φαίνεται τρομακτική, αλλά με τη σωστή προετοιμασία είναι πιο εύκολη από όσο νομίζετε. Αυτός ο οδηγός καλύπτει τα πάντα, από την επιλογή σκάφους μέχρι τι να πακετάρετε.</p>

<h3>Χρειάζεστε Δίπλωμα;</h3>
<p>Οι απαιτήσεις αδειοδότησης διαφέρουν ανά χώρα και τύπο σκάφους. Σε πολλές μεσογειακές χώρες, σκάφη κάτω από ορισμένη ιπποδύναμη μπορούν να νοικιαστούν χωρίς δίπλωμα. Ωστόσο, για ιστιοπλοϊκά και μεγαλύτερα σκάφη, θα χρειαστείτε τουλάχιστον ένα βασικό πιστοποιητικό ιστιοπλοΐας. Αν δεν έχετε δίπλωμα, μην ανησυχείτε — μπορείτε πάντα να προσλάβετε κυβερνήτη.</p>

<h3>Επιλογή του Σωστού Σκάφους</h3>
<p>Λάβετε υπόψη αυτούς τους παράγοντες:</p>
<ul>
<li><strong>Μέγεθος ομάδας:</strong> Βεβαιωθείτε ότι το σκάφος έχει αρκετή χωρητικότητα για την παρέα σας.</li>
<li><strong>Επίπεδο εμπειρίας:</strong> Αν είστε αρχάριοι, ξεκινήστε με μηχανοκίνητο σκάφος ή προσλάβετε κυβερνήτη.</li>
<li><strong>Προϋπολογισμός:</strong> Οι τιμές ποικίλλουν σημαντικά ανά τύπο σκάφους, εποχή και τοποθεσία.</li>
<li><strong>Δραστηριότητες:</strong> Θέλετε θαλάσσιο σκι; Θα χρειαστείτε μηχανοκίνητο σκάφος. Προτιμάτε χαλαρή κρουαζιέρα; Ένα καταμαράν προσφέρει τη μεγαλύτερη άνεση.</li>
</ul>

<h3>Τι Περιλαμβάνεται Συνήθως</h3>
<p>Οι περισσότερες ενοικιάσεις σκαφών περιλαμβάνουν βασικό εξοπλισμό ασφαλείας (σωσίβια, πυροσβεστήρα, κουτί πρώτων βοηθειών), όργανα πλοήγησης και βοηθητικό σκάφος. Ελέγξτε πάντα προσεκτικά τις λεπτομέρειες πριν κλείσετε.</p>

<h3>Τι να Πακετάρετε</h3>
<p>Πακετάρετε ελαφριά και χρησιμοποιήστε μαλακές τσάντες αντί για σκληρές βαλίτσες. Τα απαραίτητα περιλαμβάνουν:</p>
<ul>
<li>Αντηλιακό (SPF 50+) και γυαλιά ηλίου</li>
<li>Αντιολισθητικά παπούτσια</li>
<li>Ελαφριά ρούχα σε στρώσεις για τα δροσερά βράδια</li>
<li>Αδιάβροχη τσάντα για ηλεκτρονικά</li>
<li>Φάρμακα για ναυτία αν χρειαστεί</li>
<li>Εξοπλισμός κατάδυσης με αναπνευστήρα (αν δεν παρέχεται)</li>
</ul>

<h3>Ασφάλιση &amp; Εγγύηση</h3>
<p>Οι περισσότερες εταιρείες charter περιλαμβάνουν βασική ασφάλιση, αλλά αξίζει να ελέγξετε το ποσό απαλλαγής. Η εγγύηση (συνήθως επιστρεφόμενη) είναι τυπική και κυμαίνεται από μερικές εκατοντάδες έως αρκετές χιλιάδες ευρώ.</p>

<h3>Συμβουλές Κράτησης</h3>
<ul>
<li><strong>Κλείστε νωρίς:</strong> Τα δημοφιλή σκάφη εξαντλούνται μήνες πριν.</li>
<li><strong>Διαβάστε κριτικές:</strong> Οι εμπειρίες προηγούμενων ενοικιαστών είναι ανεκτίμητες.</li>
<li><strong>Επικοινωνήστε με τον ιδιοκτήτη:</strong> Μη διστάσετε να κάνετε ερωτήσεις πριν κλείσετε.</li>
<li><strong>Ελέγξτε την πολιτική ακύρωσης:</strong> Αναζητήστε ευέλικτη ακύρωση σε περίπτωση αλλαγής σχεδίων.</li>
</ul>

<p>Έτοιμοι να σαλπάρετε; Περιηγηθείτε στα σκάφη και βρείτε το τέλειο σκάφος για την πρώτη σας θαλάσσια περιπέτεια.</p>`,
    },
    createdAt: new Date("2026-02-10"),
  },
  {
    id: "3",
    title: {
      en: "Catamaran vs Sailboat: Which One Should You Rent?",
      el: "Καταμαράν vs Ιστιοπλοϊκό: Ποιο Πρέπει να Νοικιάσετε;",
    },
    slug: "catamaran-vs-sailboat-comparison",
    image: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=600&q=80&auto=format",
    summary: {
      en: "We break down the pros and cons of each to help you choose the perfect vessel for your next sailing adventure.",
      el: "Αναλύουμε τα πλεονεκτήματα και μειονεκτήματα του καθενός για να σας βοηθήσουμε να επιλέξετε το ιδανικό σκάφος για την επόμενη ιστιοπλοϊκή σας περιπέτεια.",
    },
    content: {
      en: `<h2>Catamaran vs Sailboat: The Ultimate Comparison</h2>
<p>Choosing between a catamaran and a monohull sailboat is one of the most common dilemmas for boat renters. Both have loyal followers, and the right choice depends on your priorities. Let's break it down.</p>

<h3>Stability &amp; Comfort</h3>
<p><strong>Catamaran wins.</strong> With two hulls, catamarans offer significantly more stability and less heeling (tilting). This makes them ideal for families with children, those prone to seasickness, or anyone who prefers a steadier ride. The flat deck provides more living space, and most catamarans have a spacious salon with panoramic views.</p>
<p>Sailboats heel when sailing upwind, which some find thrilling but others find uncomfortable. The interior is narrower, but many sailors argue this creates a more intimate, authentic sailing experience.</p>

<h3>Space &amp; Layout</h3>
<p><strong>Catamaran wins.</strong> A 42-foot catamaran typically offers as much interior space as a 50-foot monohull. The twin-hull design means cabins are separated for more privacy, and the bridge deck provides additional communal space. The trampoline net at the bow is a favourite spot for sunbathing.</p>
<p>Sailboats make efficient use of their space, with clever storage solutions throughout. However, headroom and beam are inherently more limited.</p>

<h3>Sailing Performance</h3>
<p><strong>Sailboat wins.</strong> Monohull sailboats perform better upwind and offer a more engaging sailing experience. The feeling of the hull cutting through the waves, the responsive helm, and the ability to point closer to the wind are what traditional sailors live for.</p>
<p>Catamarans are faster on a reach (sailing across the wind) but struggle more when sailing directly upwind. They're also harder to tack in tight spaces due to their wider beam.</p>

<h3>Anchoring &amp; Marinas</h3>
<p><strong>Mixed.</strong> Catamarans have a shallower draft, allowing them to anchor closer to shore and access shallow bays that monohulls cannot. However, their wider beam means marina berths are more expensive and sometimes harder to find. Some smaller ports may not accommodate wide catamarans.</p>

<h3>Cost</h3>
<p><strong>Sailboat wins on price.</strong> Catamarans are generally 30-50% more expensive to rent than a comparable-length monohull. However, when you factor in the extra space and cabins, the cost per person can be similar. Marina fees are also higher for catamarans due to their width.</p>

<h3>Our Recommendation</h3>
<table>
<thead><tr><th>Choose a Catamaran if...</th><th>Choose a Sailboat if...</th></tr></thead>
<tbody>
<tr><td>You prioritise comfort and space</td><td>You want the best sailing experience</td></tr>
<tr><td>You have a larger group (6+)</td><td>Budget is a primary concern</td></tr>
<tr><td>Anyone in your group gets seasick</td><td>You plan to visit smaller marinas</td></tr>
<tr><td>You want to anchor in shallow bays</td><td>You're an experienced sailor seeking performance</td></tr>
<tr><td>You're travelling with children</td><td>You enjoy the challenge of upwind sailing</td></tr>
</tbody>
</table>

<p>Whichever you choose, both offer an incredible way to explore the water. Browse catamarans and sailboats on TapYourBoat to find your perfect match.</p>`,
      el: `<h2>Καταμαράν vs Ιστιοπλοϊκό: Η Απόλυτη Σύγκριση</h2>
<p>Η επιλογή μεταξύ καταμαράν και μονόγαστρου ιστιοπλοϊκού είναι ένα από τα πιο συνηθισμένα διλήμματα. Και τα δύο έχουν πιστούς οπαδούς, και η σωστή επιλογή εξαρτάται από τις προτεραιότητές σας.</p>

<h3>Σταθερότητα &amp; Άνεση</h3>
<p><strong>Κερδίζει το καταμαράν.</strong> Με δύο γάστρες, τα καταμαράν προσφέρουν σημαντικά μεγαλύτερη σταθερότητα και λιγότερη κλίση. Αυτό τα κάνει ιδανικά για οικογένειες με παιδιά, όσους έχουν τάση για ναυτία ή οποιονδήποτε προτιμά πιο σταθερή πλεύση. Το επίπεδο κατάστρωμα προσφέρει περισσότερο χώρο διαβίωσης.</p>
<p>Τα ιστιοπλοϊκά γέρνουν όταν πλέουν κόντρα στον άνεμο, κάτι που κάποιοι βρίσκουν συναρπαστικό αλλά άλλοι άβολο. Το εσωτερικό είναι πιο στενό, αλλά πολλοί ιστιοπλόοι υποστηρίζουν ότι δημιουργεί μια πιο αυθεντική εμπειρία.</p>

<h3>Χώρος &amp; Διάταξη</h3>
<p><strong>Κερδίζει το καταμαράν.</strong> Ένα καταμαράν 42 ποδιών προσφέρει συνήθως τόσο εσωτερικό χώρο όσο ένα μονόγαστρο 50 ποδιών. Ο σχεδιασμός διπλής γάστρας σημαίνει ότι οι καμπίνες είναι χωρισμένες για περισσότερη ιδιωτικότητα.</p>
<p>Τα ιστιοπλοϊκά αξιοποιούν αποδοτικά τον χώρο τους με έξυπνες λύσεις αποθήκευσης. Ωστόσο, το ύψος και το πλάτος είναι εγγενώς πιο περιορισμένα.</p>

<h3>Επιδόσεις Ιστιοπλοΐας</h3>
<p><strong>Κερδίζει το ιστιοπλοϊκό.</strong> Τα μονόγαστρα αποδίδουν καλύτερα κόντρα στον άνεμο και προσφέρουν πιο συναρπαστική εμπειρία ιστιοπλοΐας. Η αίσθηση της γάστρας να σκίζει τα κύματα είναι αυτό που ζουν οι παραδοσιακοί ιστιοπλόοι.</p>
<p>Τα καταμαράν είναι ταχύτερα σε πλάγιο άνεμο αλλά δυσκολεύονται περισσότερο κόντρα στον άνεμο. Επίσης, είναι πιο δύσκολο να στρίψουν σε στενούς χώρους λόγω του μεγαλύτερου πλάτους.</p>

<h3>Αγκυροβόλιο &amp; Μαρίνες</h3>
<p><strong>Μικτά αποτελέσματα.</strong> Τα καταμαράν έχουν μικρότερο βύθισμα, επιτρέποντάς τους να αγκυροβολούν πιο κοντά στην ακτή. Ωστόσο, το μεγαλύτερο πλάτος τους σημαίνει ακριβότερες θέσεις σε μαρίνες.</p>

<h3>Κόστος</h3>
<p><strong>Κερδίζει το ιστιοπλοϊκό στην τιμή.</strong> Τα καταμαράν είναι γενικά 30-50% ακριβότερα στην ενοικίαση από ένα αντίστοιχου μήκους μονόγαστρο. Ωστόσο, αν υπολογίσετε τον επιπλέον χώρο, το κόστος ανά άτομο μπορεί να είναι παρόμοιο.</p>

<h3>Η Σύστασή μας</h3>
<table>
<thead><tr><th>Επιλέξτε Καταμαράν αν...</th><th>Επιλέξτε Ιστιοπλοϊκό αν...</th></tr></thead>
<tbody>
<tr><td>Προτιμάτε άνεση και χώρο</td><td>Θέλετε την καλύτερη εμπειρία ιστιοπλοΐας</td></tr>
<tr><td>Έχετε μεγάλη ομάδα (6+)</td><td>Ο προϋπολογισμός είναι βασική προτεραιότητα</td></tr>
<tr><td>Κάποιος στην ομάδα παθαίνει ναυτία</td><td>Σχεδιάζετε να επισκεφτείτε μικρές μαρίνες</td></tr>
<tr><td>Θέλετε να αγκυροβολείτε σε ρηχά</td><td>Είστε έμπειρος ιστιοπλόος που αναζητά επιδόσεις</td></tr>
<tr><td>Ταξιδεύετε με παιδιά</td><td>Απολαμβάνετε την πρόκληση της πλεύσης κόντρα στον άνεμο</td></tr>
</tbody>
</table>

<p>Όποιο κι αν επιλέξετε, και τα δύο προσφέρουν έναν εκπληκτικό τρόπο εξερεύνησης της θάλασσας. Περιηγηθείτε σε καταμαράν και ιστιοπλοϊκά για να βρείτε το ιδανικό σκάφος.</p>`,
    },
    createdAt: new Date("2026-01-28"),
  },
];
