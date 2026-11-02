"""
Pest and treatment knowledge base.
Maps crop + soil combinations to likely pests, symptoms, and treatments.
"""

# pest_name -> details
# Keys in lowercase match the EfficientNetB4 model class labels exactly (direct hit).
# Title-case keys remain for crop-analysis pest lookups.
PEST_DETAILS = {
    # ── EfficientNetB4 model classes (lowercase = exact match from detector) ────
    "ants": {
        "scientific_name": "Formicidae spp.",
        "symptoms": "Tunneling near root zone, tending aphid colonies (which worsen plant stress), stem-base biting on seedlings, soil mounds disrupting root development.",
        "preferred_soils": ["Sandy", "Loamy"],
        "pesticide": "Chlorpyrifos 20% EC (2 ml/L drench around mounds) or Bifenthrin 10% SC granules worked into soil. Target mound entrance in early morning.",
        "organic": "Diatomaceous earth barrier around plant bases; cinnamon or citrus-peel powder as deterrent; boiling water poured directly onto mounds; beneficial nematodes (Steinernema) for soil application.",
        "fertilizer_note": "Ants farm aphids for honeydew — control aphid populations first to break the cycle. Avoid excess nitrogen which promotes lush growth attractive to aphids.",
    },
    "bees": {
        "scientific_name": "Apidae spp.",
        "symptoms": "Bees are essential pollinators — their presence improves crop yield and fruit set. They are NOT a crop pest. Detection may indicate healthy flowering vegetation nearby.",
        "preferred_soils": [],
        "pesticide": "IMPORTANT: Do NOT spray pesticides on or near bees. If a hive is located in a problematic area, contact a registered beekeeper for safe, live relocation. Bee populations are legally protected in many regions.",
        "organic": "If stings are a work-safety concern, plant eucalyptus or peppermint near access paths as a mild deterrent. Schedule field operations (spraying, harvesting) in the evening when bees are less active.",
        "fertilizer_note": "Support pollinator health by maintaining diverse flowering plants near crops. Strong pollination from bees can increase fruit/grain yield by 15–30%. Avoid pesticide application during flowering.",
    },
    "beetle": {
        "scientific_name": "Coleoptera spp.",
        "symptoms": "Round or irregular holes in leaves, chewed leaf edges, defoliation in heavy infestations. Root-feeding larvae (grubs) cause sudden wilting and yellowing. Bark-boring species create entry wounds for fungal disease.",
        "preferred_soils": ["Loamy", "Sandy", "Red"],
        "pesticide": "Foliar feeders: Imidacloprid 17.8% SL (0.5 ml/L) or Lambda-cyhalothrin 5% EC (1 ml/L). Soil larvae: Carbofuran 3G incorporated at planting or Chlorpyrifos drench (3 ml/L).",
        "organic": "Hand-pick adults during cool morning hours; Beauveria bassiana biopesticide (5 g/L); Neem Seed Kernel Extract 5% spray; row covers on young transplants; deep summer plowing exposes larvae to predators.",
        "fertilizer_note": "Healthy, well-nourished plants tolerate beetle damage better and recover faster. Balanced NPK with adequate calcium strengthens cell walls. Avoid waterlogging which stresses roots and attracts grub species.",
    },
    "catterpillar": {
        "scientific_name": "Lepidoptera larvae spp.",
        "symptoms": "Irregular feeding holes in leaves, skeletonized foliage, frass (dark pellet droppings) on leaves and soil, rolled or webbed leaves, defoliation in heavy pressure. Young larvae feed in groups; older larvae disperse.",
        "preferred_soils": ["Loamy", "Sandy", "Red"],
        "pesticide": "Chlorantraniliprole 18.5% SC (0.3 ml/L) or Emamectin Benzoate 5% SG (0.4 g/L) or Indoxacarb 15.8% EC (1 ml/L). Apply in evening when larvae are most active.",
        "organic": "Bacillus thuringiensis (Bt) var. kurstaki spray at dusk (targets feeding larvae only); Nuclear Polyhedrosis Virus (NPV); Trichogramma chilonis egg-parasitoid release; hand-collect egg masses and early-instar clusters.",
        "fertilizer_note": "Avoid excessive nitrogen fertilization which produces lush, soft foliage preferred by caterpillars. Adequate potassium strengthens leaf cell walls, reducing feeding damage. Monitor crops weekly during larval season.",
    },
    "earthworms": {
        "scientific_name": "Lumbricus spp. / Pheretima spp.",
        "symptoms": "Earthworms are highly BENEFICIAL soil organisms — NOT a pest. They aerate soil, improve drainage, enhance water infiltration, and produce nutrient-rich castings. Their presence indicates good soil health.",
        "preferred_soils": ["Loamy", "Black", "Clayey"],
        "pesticide": "Do NOT apply pesticides to eliminate earthworms. They are vital to soil ecosystem health. Organophosphates and carbamates are highly toxic to earthworms and should be avoided when possible.",
        "organic": "Encourage earthworm populations by incorporating organic matter (compost, vermicompost, green manures). Minimize deep tillage. Maintain adequate soil moisture. Avoid burning crop residues.",
        "fertilizer_note": "Earthworm castings improve soil structure and provide plant-available N, P, K. Regular organic matter inputs sustain earthworm populations. pH between 6–7 is optimal. Avoid highly acidic or saline fertilizers.",
    },
    "earwig": {
        "scientific_name": "Forficula auricularia",
        "symptoms": "Ragged, irregular holes in leaves with smooth edges (unlike caterpillar damage), seedling stems chewed near ground level, petals and soft fruit flesh eaten. Active at night; shelter in moist soil crevices or under debris by day.",
        "preferred_soils": ["Sandy", "Loamy"],
        "pesticide": "Carbaryl 50% WP (2 g/L) or Malathion 50% EC (1.5 ml/L) as evening ground spray around plant bases. Repeat after rain. Avoid daytime application when earwigs are hidden.",
        "organic": "Set cardboard tube or damp newspaper traps at dusk — collect and destroy each morning; diatomaceous earth barrier around plant bases; reduce deep mulch layers that provide harborage; eliminate weeds around crop edges.",
        "fertilizer_note": "Good soil drainage discourages earwigs (they prefer moist, sheltered spots). Maintain plant vigor with balanced nutrition so plants can tolerate minor feeding damage without yield loss.",
    },
    "grasshopper": {
        "scientific_name": "Melanoplus spp. / Locusta migratoria",
        "symptoms": "Ragged leaf edges and stems, total defoliation in severe outbreaks, crop stripping from field margins inward, chewed seedlings. Damage is sudden and widespread during hot dry periods.",
        "preferred_soils": ["Sandy", "Red"],
        "pesticide": "Malathion 50% EC (2 ml/L) or Lambda-cyhalothrin 5% EC (1 ml/L). Apply in early morning or late evening when grasshoppers are less active. Perimeter spraying most effective for invading swarms.",
        "organic": "Metarhizium acridum (Green Muscle bioinsecticide) — highly specific to grasshoppers; early morning spraying when insects are sluggish from cold; poultry grazing in field margins; Nosema locustae bait for long-term control.",
        "fertilizer_note": "Maintain a healthy, dense crop canopy to improve resilience. Adequate potassium promotes faster recovery of damaged tissue. After grasshopper pressure, supplemental foliar nutrition (micronutrients) helps regrowth.",
    },
    "moth": {
        "scientific_name": "Lepidoptera spp. (adult)",
        "symptoms": "Adult moths are the reproductive stage — crop damage is caused by their larvae (caterpillars). Signs include egg clusters on leaf undersides, early-instar group feeding, frass accumulation, fruit boring, and stem entry holes.",
        "preferred_soils": ["Loamy", "Sandy", "Red"],
        "pesticide": "Target larval stage: Indoxacarb 15.8% EC (1 ml/L) or Spinosad 45% SC (0.3 ml/L) or Lambda-cyhalothrin 5% EC (1 ml/L). Light traps reduce adult populations and help time larval control sprays.",
        "organic": "Pheromone traps to monitor and disrupt adult mating; Bacillus thuringiensis (Bt) spray targeting young larvae; light traps for adults; Trichogramma parasitoid releases at egg-laying peaks.",
        "fertilizer_note": "Scout crops from early growth stages and track moth flight using pheromone traps. Vigorous, well-nourished plants recover faster from early larval feeding. Avoid excessive nitrogen which extends soft tissue susceptibility.",
    },
    "slug": {
        "scientific_name": "Deroceras reticulatum / Arion spp.",
        "symptoms": "Irregular holes in leaves with silvery slime trails on plant surfaces and soil, collapsed or missing seedlings, damage occurring overnight or in wet weather. Most severe in cool, moist conditions.",
        "preferred_soils": ["Clayey", "Loamy", "Black"],
        "pesticide": "Metaldehyde 6% bait pellets (5 kg/acre broadcast in evening) or Iron(III) phosphate bait (Ferramol) — safer around birds, mammals, and beneficial insects. Reapply after heavy rain.",
        "organic": "Diatomaceous earth or coarse sand barriers around plant bases; beer traps (shallow containers sunk at soil level); copper tape on raised beds; reduce surface mulch depth; hand-collect slugs after nightfall with torchlight.",
        "fertilizer_note": "Avoid over-irrigation and surface waterlogging which create ideal slug conditions. Ensure good field drainage. Calcium-rich soils are less favourable to slugs. Established, vigorous seedlings are less vulnerable than transplants.",
    },
    "snail": {
        "scientific_name": "Helix aspersa / Achatina fulica",
        "symptoms": "Large irregular holes in leaves, missing seedlings near soil level, slime trails across leaves and soil surface, damaged ripe fruit, shells visible near plants or under debris.",
        "preferred_soils": ["Clayey", "Loamy", "Black"],
        "pesticide": "Metaldehyde 6% bait pellets (5 kg/acre) scattered in evening or Iron(III) phosphate (Ferramol) bait — environmentally safer option. Reapply every 2 weeks or after significant rain.",
        "organic": "Hand-collect snails at night (most active after rain); remove hiding places (stones, boards, thick mulch); copper tape barriers on raised beds; encourage natural predators (ground beetles, hedgehogs, ducks in rice fields); beer traps.",
        "fertilizer_note": "Snails thrive in moist, alkaline soil conditions. Improve drainage and avoid overhead irrigation. Healthy, established plants tolerate snail damage better than stressed or newly transplanted seedlings.",
    },
    "wasp": {
        "scientific_name": "Vespula spp. / Polistes spp.",
        "symptoms": "Wasps are largely BENEFICIAL predators of caterpillars, flies, and other crop pests. In late season, some species feed on ripe fruit (grapes, figs, stone fruit), leaving entry holes and secondary fungal rots.",
        "preferred_soils": [],
        "pesticide": "For problem nests near harvest areas: Cypermethrin 10% EC (1 ml/L) applied directly into nest entrance at night. Avoid broad-area spraying which kills beneficial predatory wasps and disrupts natural pest control.",
        "organic": "Yellow sticky traps or pheromone lure traps to monitor populations; protect ripe fruit with fine mesh netting; remove fallen fruit promptly to reduce feeding sites; destroy problem nests at night when all wasps are inside.",
        "fertilizer_note": "Maintain wasp-attractive flower strips near crop borders to sustain beneficial predatory populations throughout the season. Broad-spectrum pesticide use destroys these natural allies and can lead to secondary pest outbreaks.",
    },
    "weevil": {
        "scientific_name": "Curculionidae spp.",
        "symptoms": "Notched or scalloped leaf margins (adult feeding), small round exit holes in seeds and grain, larval boring in stems, roots, or fruit causing wilting and internal damage. Grain weevils cause significant post-harvest losses.",
        "preferred_soils": ["Sandy", "Loamy", "Red"],
        "pesticide": "Field: Malathion 50% EC (1 ml/L) or Chlorpyrifos 20% EC (2 ml/L) as foliar spray. Grain storage: Aluminum phosphide tablets (3 g/tonne, sealed storage) or Deltamethrin 2.5% WP as surface treatment on storage walls.",
        "organic": "Neem oil spray (5 ml/L) on field crops; diatomaceous earth mixed into stored grain (1 kg/tonne); cool, dry storage conditions (below 10°C, below 10% grain moisture); essential oil fumigants (clove oil); hermetic bag storage.",
        "fertilizer_note": "Timely harvest at correct moisture content (14% for cereals) minimizes grain weevil entry. Field weevils prefer drought-stressed plants — maintain adequate irrigation and balanced nutrition to improve plant vigor and resistance.",
    },
    "Aphids": {
        "scientific_name": "Aphidoidea spp.",
        "symptoms": "Yellowing leaves, sticky honeydew residue, distorted shoots, black sooty mold on foliage.",
        "preferred_soils": ["Sandy", "Loamy"],
        "pesticide": "Imidacloprid 17.8% SL (0.5 ml/L) or Thiamethoxam 25% WG (0.3 g/L)",
        "organic": "Neem oil spray (5 ml/L) or strong water jets to dislodge colonies",
        "fertilizer_note": "Reduce excess nitrogen — lush growth attracts aphids.",
    },
    "Stem Borer": {
        "scientific_name": "Chilo partellus / Scirpophaga spp.",
        "symptoms": "Dead hearts in young plants, whitish frass, broken stems, unfilled grain panicles.",
        "preferred_soils": ["Loamy", "Clayey", "Black"],
        "pesticide": "Chlorpyrifos 20% EC (2.5 ml/L) or Carbofuran 3G (soil application 1 kg/acre)",
        "organic": "Trichogramma chilonis egg-parasitoid release; pheromone traps",
        "fertilizer_note": "Split-apply nitrogen; avoid over-fertilizing at early vegetative stage.",
    },
    "Leaf Blight": {
        "scientific_name": "Helminthosporium turcicum (fungal)",
        "symptoms": "Long, tan-grey lesions with wavy margins on leaves; premature leaf death.",
        "preferred_soils": ["Loamy", "Sandy"],
        "pesticide": "Mancozeb 75% WP (2.5 g/L) or Propiconazole 25% EC (1 ml/L)",
        "organic": "Trichoderma viride seed treatment; avoid overhead irrigation",
        "fertilizer_note": "Apply potassium to strengthen cell walls and reduce susceptibility.",
    },
    "Fall Armyworm": {
        "scientific_name": "Spodoptera frugiperda",
        "symptoms": "Irregular windowing on leaves, heavy defoliation, frass in leaf whorls.",
        "preferred_soils": ["Loamy", "Sandy", "Red"],
        "pesticide": "Spinetoram 11.7% SC (0.5 ml/L) or Emamectin Benzoate 5% SG (0.4 g/L)",
        "organic": "Bacillus thuringiensis (Bt) spray; release of egg parasitoids",
        "fertilizer_note": "Balanced NPK promotes crop vigor and faster recovery from damage.",
    },
    "Whitefly": {
        "scientific_name": "Bemisia tabaci",
        "symptoms": "Yellowing, silvering of leaves; honeydew secretion causing sooty mold; virus vector.",
        "preferred_soils": ["Sandy", "Loamy", "Red"],
        "pesticide": "Acetamiprid 20% SP (0.2 g/L) or Spiromesifen 22.9% SC (0.75 ml/L)",
        "organic": "Yellow sticky traps; neem oil (5 ml/L); reflective mulch",
        "fertilizer_note": "Avoid excessive nitrogen; use slow-release formulations.",
    },
    "Bollworm": {
        "scientific_name": "Helicoverpa armigera",
        "symptoms": "Circular holes in bolls, fallen squares, internal feeding with frass, reduced lint.",
        "preferred_soils": ["Black", "Loamy", "Clayey"],
        "pesticide": "Indoxacarb 15.8% EC (1 ml/L) or Flubendiamide 20% WG (0.5 g/L)",
        "organic": "Bt spray; NPV (Nuclear Polyhedrosis Virus); pheromone traps",
        "fertilizer_note": "High nitrogen delays maturity, prolonging pest risk window.",
    },
    "Thrips": {
        "scientific_name": "Thrips tabaci / Scirtothrips dorsalis",
        "symptoms": "Silver-streaked leaves, distorted growth, scarred bolls/fruits, petal discoloration.",
        "preferred_soils": ["Sandy", "Red", "Loamy"],
        "pesticide": "Spinosad 45% SC (0.3 ml/L) or Fipronil 5% SC (1.5 ml/L)",
        "organic": "Blue sticky traps; neem oil; predatory mites (Amblyseius cucumeris)",
        "fertilizer_note": "Maintain adequate soil moisture; water-stressed plants are more susceptible.",
    },
    "Brown Plant Hopper": {
        "scientific_name": "Nilaparvata lugens",
        "symptoms": "Circular 'hopperburn' patches, wilting, hollow stems, honeydew-sooty mold.",
        "preferred_soils": ["Clayey", "Loamy", "Black"],
        "pesticide": "Buprofezin 25% SC (1 ml/L) or Pymetrozine 50% WG (0.6 g/L)",
        "organic": "Drain fields periodically; conserve natural predators (spiders, mirid bugs)",
        "fertilizer_note": "Avoid split urea applications that cause lush canopy — reduces BPH refugia.",
    },
    "Blast Disease": {
        "scientific_name": "Magnaporthe oryzae (fungal)",
        "symptoms": "Diamond-shaped grey lesions with dark borders; neck blast causes white heads.",
        "preferred_soils": ["Sandy", "Red", "Loamy"],
        "pesticide": "Tricyclazole 75% WP (0.6 g/L) or Isoprothiolane 40% EC (1.5 ml/L)",
        "organic": "Silicon fertilization; seed treatment with Pseudomonas fluorescens",
        "fertilizer_note": "Excess nitrogen increases blast severity — use split doses and silica supplements.",
    },
    "Powdery Mildew": {
        "scientific_name": "Erysiphe graminis (fungal)",
        "symptoms": "White powdery coating on leaves/stems, yellowing, premature senescence.",
        "preferred_soils": ["Sandy", "Loamy"],
        "pesticide": "Tebuconazole 25.9% EC (1 ml/L) or Hexaconazole 5% SC (2 ml/L)",
        "organic": "Sulfur dust (20 g/L) or potassium bicarbonate spray",
        "fertilizer_note": "Balanced phosphorus and potassium improves resistance.",
    },
    "Cutworm": {
        "scientific_name": "Agrotis spp.",
        "symptoms": "Seedlings cut at ground level overnight, wilted plants, soil surface damage.",
        "preferred_soils": ["Sandy", "Loamy", "Red"],
        "pesticide": "Chlorpyrifos 20% EC (2 ml/L drench) or Quinalphos 25% EC (2 ml/L)",
        "organic": "Deep summer plowing; Bacillus thuringiensis soil drench; collar barriers",
        "fertilizer_note": "Incorporate organic matter; avoid fresh manure which attracts egg-laying moths.",
    },
    "Termites": {
        "scientific_name": "Odontotermes spp.",
        "symptoms": "Hollowed stems, root damage, plant collapse, mud tubes near roots.",
        "preferred_soils": ["Sandy", "Red", "Black"],
        "pesticide": "Chlorpyrifos 20% EC soil drench (5 ml/L) or Imidacloprid 30.5% SC",
        "organic": "Neem cake incorporation (250 kg/acre); Metarhizium anisopliae bioinsecticide",
        "fertilizer_note": "Improve soil moisture retention; dry sandy soils increase termite risk.",
    },
    "Rust": {
        "scientific_name": "Puccinia spp. (fungal)",
        "symptoms": "Orange/brown powdery pustules on leaf undersides, yellowing, reduced photosynthesis.",
        "preferred_soils": ["Loamy", "Black", "Clayey"],
        "pesticide": "Propiconazole 25% EC (1 ml/L) or Mancozeb 75% WP (2.5 g/L)",
        "organic": "Neem oil spray; sulfur-based fungicide; crop rotation",
        "fertilizer_note": "Adequate potassium strengthens cell walls; avoid excess nitrogen.",
    },
    "Pod Borer": {
        "scientific_name": "Maruca vitrata / Helicoverpa armigera",
        "symptoms": "Holes in pods, webbing, premature pod shedding, damaged seeds.",
        "preferred_soils": ["Red", "Sandy", "Loamy"],
        "pesticide": "Indoxacarb 15.8% EC (1 ml/L) or Chlorantraniliprole 18.5% SC (0.3 ml/L)",
        "organic": "Bt spray at pod initiation; NPV spray; pheromone traps",
        "fertilizer_note": "Avoid late nitrogen application that extends pod-filling period.",
    },
    "White Grub": {
        "scientific_name": "Holotrichia spp.",
        "symptoms": "Underground root feeding, sudden wilting, yellow-brown patches, easy uprooting.",
        "preferred_soils": ["Sandy", "Red", "Loamy"],
        "pesticide": "Imidacloprid 600 FS seed treatment (5 ml/kg) or Chlorpyrifos soil incorporation",
        "organic": "Entomopathogenic nematodes (Steinernema); Metarhizium anisopliae; deep plowing",
        "fertilizer_note": "Incorporate well-decomposed compost; raw organic matter encourages grub populations.",
    },
    "Tobacco Caterpillar": {
        "scientific_name": "Spodoptera litura",
        "symptoms": "Group feeding on leaves, skeletonized leaves, irregular holes, defoliation.",
        "preferred_soils": ["Sandy", "Red", "Loamy"],
        "pesticide": "Emamectin Benzoate 5% SG (0.4 g/L) or Chlorpyrifos 20% EC (2 ml/L)",
        "organic": "NPV of S. litura spray; collect and destroy egg masses; pheromone traps",
        "fertilizer_note": "Field sanitation removes debris where moths lay eggs.",
    },
    "Sugarcane Borer": {
        "scientific_name": "Diatraea saccharalis / Chilo infuscatellus",
        "symptoms": "Dead hearts, reddish internodes, hollow stems, side holes with frass.",
        "preferred_soils": ["Black", "Loamy", "Clayey"],
        "pesticide": "Chlorpyrifos 20% EC (2.5 ml/L) or Carbofuran 3G (soil drench 15 kg/acre)",
        "organic": "Cotesia flavipes parasitoid release; Trichogramma chilonis egg parasitoid",
        "fertilizer_note": "Balanced nitrogen avoids excessive tillering that provides more borer sites.",
    },
    "Grasshopper": {
        "scientific_name": "Melanoplus spp. / Locusta migratoria",
        "symptoms": "Ragged leaf edges, total defoliation in severe infestations, crop stripping.",
        "preferred_soils": ["Sandy", "Red"],
        "pesticide": "Malathion 50% EC (2 ml/L) or Lambda-cyhalothrin 5% EC (1 ml/L)",
        "organic": "Metarhizium acridum (Green Muscle bioinsecticide); early morning spraying when sluggish",
        "fertilizer_note": "Healthy dense canopy recovers faster; maintain adequate potassium.",
    },
}

# crop -> list of pest names (from PEST_DETAILS keys)
CROP_PESTS = {
    "Maize": ["Stem Borer", "Fall Armyworm", "Aphids", "Cutworm"],
    "Sugarcane": ["Sugarcane Borer", "Termites", "Aphids", "White Grub"],
    "Cotton": ["Bollworm", "Whitefly", "Thrips", "Aphids"],
    "Tobacco": ["Tobacco Caterpillar", "Aphids", "Thrips", "Whitefly"],
    "Paddy": ["Brown Plant Hopper", "Stem Borer", "Blast Disease", "Leaf Blight"],
    "Barley": ["Powdery Mildew", "Aphids", "Rust", "Cutworm"],
    "Wheat": ["Rust", "Aphids", "Powdery Mildew", "Grasshopper"],
    "Millets": ["Stem Borer", "Fall Armyworm", "Aphids", "Grasshopper"],
    "Oil seeds": ["Aphids", "Whitefly", "Pod Borer", "Thrips"],
    "Pulses": ["Pod Borer", "Aphids", "Thrips", "Cutworm"],
    "Ground Nuts": ["White Grub", "Thrips", "Leaf Blight", "Aphids"],
}

# soil type -> general fertilizer recommendation note
SOIL_FERTILIZER_NOTES = {
    "Sandy": (
        "Sandy soils drain quickly and lose nutrients fast. "
        "Use slow-release fertilizers (coated urea, polymer-coated NPK). "
        "Apply in frequent small splits rather than one heavy dose. "
        "Incorporate organic matter (compost, vermicompost) to improve water retention."
    ),
    "Loamy": (
        "Loamy soils have good nutrient-holding capacity. "
        "Standard NPK formulations work well — follow soil test ratios. "
        "Maintain organic matter with compost or green manure. "
        "Moderate irrigation and balanced fertilization give best results."
    ),
    "Black": (
        "Black (Regur) soils are self-mulching with high clay and calcium content. "
        "They retain moisture but can become water-logged. "
        "Improve drainage before heavy fertilization. "
        "These soils tend to be phosphorus-fixing — use phosphate fertilizers with zinc sulfate."
    ),
    "Red": (
        "Red soils are poor in nitrogen, phosphorus, and organic matter. "
        "Heavy supplementation with FYM (farmyard manure) and micronutrients (Zn, Fe, Mn) needed. "
        "Drip fertigation with soluble NPK is highly effective. "
        "Acidic pH (5.5–6.5) — liming may be needed before fertilizer application."
    ),
    "Clayey": (
        "Clayey soils hold nutrients well but have poor aeration and drainage. "
        "Avoid waterlogging — use raised beds or sub-surface drainage. "
        "Apply fertilizers in smaller doses to prevent anaerobic conditions. "
        "Gypsum application improves soil structure and calcium availability."
    ),
}


def get_pests_for_crop(crop_name, soil_type=None):
    """
    Returns a list of pest detail dicts for a given crop.
    If soil_type is given, sorts pests preferring those with a matching soil preference first.
    """
    pest_names = CROP_PESTS.get(crop_name, [])
    results = []
    for name in pest_names:
        detail = PEST_DETAILS.get(name)
        if detail:
            entry = {"name": name, **detail}
            results.append(entry)

    if soil_type:
        results.sort(
            key=lambda p: 0 if soil_type in p.get("preferred_soils", []) else 1
        )

    return results


def get_soil_fertilizer_note(soil_type):
    return SOIL_FERTILIZER_NOTES.get(soil_type, "")


def get_treatment_for_pest(pest_name):
    """
    Returns treatment details for a detected pest.
    Uses direct → case-insensitive → partial matching.
    Falls back to generic IPM advice when no match found.
    """
    if not pest_name:
        return _generic_treatment(pest_name)

    # Direct match
    if pest_name in PEST_DETAILS:
        return {"name": pest_name, **PEST_DETAILS[pest_name]}

    # Case-insensitive exact match
    for key, val in PEST_DETAILS.items():
        if key.lower() == pest_name.lower():
            return {"name": key, **val}

    # Partial match (model label contains or is contained in KB key)
    pest_lower = pest_name.lower()
    for key, val in PEST_DETAILS.items():
        if key.lower() in pest_lower or pest_lower in key.lower():
            return {"name": key, **val}

    return _generic_treatment(pest_name)


def _generic_treatment(pest_name):
    return {
        "name": pest_name or "Unknown Pest",
        "scientific_name": "",
        "symptoms": "Monitor crop carefully for visible feeding damage, discoloration, or wilting.",
        "preferred_soils": [],
        "pesticide": "Consult your local agricultural extension officer for a product specific to this pest.",
        "organic": "Implement general IPM practices: crop rotation, removal of infested plant parts, and release of natural predators.",
        "fertilizer_note": "Maintain balanced NPK nutrition to promote plant vigor and faster recovery from pest damage.",
    }
