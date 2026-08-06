/* AP English Language — the end-of-lesson quiz bank.
   ===========================================================================

   One graded quiz per concept, four items each, served in full at the bottom of
   the lesson. This is the instrument that decides whether a concept reads
   solid, shaky or weak; the flashcards behind it keep what it finds.

   Field contract, identical to the physics centre's — id, conceptId, stem,
   options, answer, why, whyNot, source. `whyNot` carries one note per WRONG
   option, in authored order, skipping the correct one, so a four-option item
   has exactly three. selfCheck refuses anything else.

   TWO RULES THIS BANK IS WRITTEN UNDER, both of which selfCheck enforces:

   1. **The options must not differ in length.** Writing the right answer as a
      full explanation and the wrong ones as bare claims makes the longest
      option correct far more often than chance, and a student will find that
      pattern long before they find the rhetoric. So the option states the
      claim and `why` carries the reasoning — which is where a reader wants it
      anyway, since `why` is what they read after committing.
   2. **No option refers to another by position.** Options are shuffled on
      every attempt.

   ON QUOTATION. Every passage, sentence and example here was written for this
   study site. Nothing is attributed to a real writer, because an invented
   sentence with a real name on it is the one error in this file that would be
   worth nothing to catch later. Where a rubric is quoted, the words are the
   College Board's and are marked as such; where an exam requirement is stated,
   it comes from the same single CED extract the rest of the centre was built
   from. Nothing else in an item is a quotation of anything.
   =========================================================================== */
"use strict";

var QUIZ = [

/* ---- The rhetorical situation --------------------------------------------- */

{
  id: "qz-rs-situation-01",
  conceptId: "rs-situation",
  source: "Skill 1.A",
  stem: "The CED defines the rhetorical situation as six components taken **collectively**. What does that word rule out?",
  options: [
    "Treating any one component as the situation on its own",
    "Analysing a text with fewer than six body paragraphs",
    "Naming more than one purpose for a single text",
    "Using the term for texts other than speeches"
  ],
  answer: 0,
  why: "The situation is the relation among exigence, purpose, audience, writer, context and message — not any of them separately. That is why a paragraph that pins down the audience and stops has described a component rather than a situation.",
  whyNot: [
    "The rubric says nothing about paragraph counts, and structure is meant to follow the reasoning rather than a template.",
    "Multiple purposes are explicitly normal: a text can console in order to free its audience to act.",
    "The framework applies to written argument as readily as to oratory."
  ]
},
{
  id: "qz-rs-situation-02",
  conceptId: "rs-situation",
  source: "Skill 1.A",
  stem: "Which pairing of the six components is the one most often confused, and on what axis?",
  options: [
    "Writer and audience: who speaks against who listens",
    "Exigence and context: what provoked the text against what surrounds it",
    "Message and audience: what is said against who hears it",
    "Purpose and writer: what is wanted against who wants it"
  ],
  answer: 1,
  why: "Exigence is a trigger you could point at; context is the set of conditions the response has to work within. The test is which one, removed, would mean no text at all on this date.",
  whyNot: [
    "These two are rarely conflated, since one produces the text and the other receives it.",
    "Message and audience are distinct in kind and seldom substituted for one another.",
    "Purpose and writer are separable without much difficulty; the harder pair is purpose and message."
  ]
},
{
  id: "qz-rs-situation-03",
  conceptId: "rs-situation",
  source: "Skill 1.A",
  stem: "On the free-response section, where is skill 1.A — reading a rhetorical situation — a reporting category?",
  options: [
    "In Row B and Row C of all three essays",
    "In Row A of all three essays",
    "Nowhere; it is examined only in the multiple-choice section",
    "On Question 2 only, in its Row A and Row B"
  ],
  answer: 3,
  why: "The reading of a situation is examined once, on the Rhetorical Analysis. Writing *to* a situation — skill 2.A — is examined everywhere, in Row B and Row C of all three essays. That asymmetry is worth knowing before allocating revision time.",
  whyNot: [
    "That is skill 2.A, the writing side of the same idea.",
    "Row A is the thesis row, and 1.A appears there only on Question 2.",
    "It is a reporting category on Question 2, so it is examined in both sections."
  ]
},
{
  id: "qz-rs-situation-04",
  conceptId: "rs-situation",
  source: "Skill 1.A",
  stem: "Why can a summary of what a passage says never explain a rhetorical choice?",
  options: [
    "Because summaries are always shorter than the passage they describe",
    "Because a summary records content",
    "Because summary is barred by the Row B decision rules on all three questions",
    "Because the reader has already read the passage and needs no reminder"
  ],
  answer: 1,
  why: "Explaining a choice means saying why this option beat the others available, and only the audience, purpose, exigence and context supply the variables that make one option better than another. A summary contains none of them.",
  whyNot: [
    "Length is incidental; a long summary explains no more than a short one.",
    "Summary is indeed described in the one-point decision rules, but that is the consequence rather than the reason.",
    "True and beside the point — a summary would fail even if the reader had never seen the passage."
  ]
},

{
  id: "qz-rs-exigence-01",
  conceptId: "rs-exigence",
  source: "Skill 1.A",
  stem: "A letter argues against a council's decision last Tuesday to cut a bus route. What is the exigence?",
  options: [
    "The bus route, which is what the letter is about",
    "Getting the council to reverse its decision",
    "The council's decision last Tuesday to cut the route",
    "The needs of the passengers who use the route"
  ],
  answer: 2,
  why: "The test is whether the text would exist without it. The route existed before Tuesday and produced no letter; the decision is what provoked one.",
  whyNot: [
    "That is the topic, and the topic was true before the decision was taken.",
    "That is the purpose — what the writer wants to happen next.",
    "Those needs are part of the context, and they too predate the letter."
  ]
},
{
  id: "qz-rs-exigence-02",
  conceptId: "rs-exigence",
  source: "Skill 1.A",
  stem: "What are the two layers of exigence, and which is worth writing about?",
  options: [
    "The stated and the hidden; the stated one, since it is evidenced",
    "The occasion and the deeper pressure",
    "The writer's and the audience's; the audience's, since it explains uptake",
    "The historical and the personal; the historical one, since it can be verified"
  ],
  answer: 1,
  why: "The immediate occasion explains why there is a text at all; the deeper pressure explains why *this* text and not a generic one. On Question 2 the prompt's background sentence usually names the occasion outright, so naming it back earns nothing.",
  whyNot: [
    "Exigence is not divided into stated and hidden, and the analytically useful layer is the one the prompt does not supply.",
    "An exigence belongs to the situation the writer is responding to, not to two separate parties.",
    "Verifiability is not the criterion; what matters is which pressure the text is answering."
  ]
},
{
  id: "qz-rs-exigence-03",
  conceptId: "rs-exigence",
  source: "Skill 1.A",
  stem: "Why does naming the exigence often earn nothing on Question 2?",
  options: [
    "Because exigence is not a reporting category on Question 2",
    "Because the rubric treats exigence as part of the thesis row only",
    "Because exigence cannot be established from a passage alone",
    "Because the prompt's background sentence has usually already named it"
  ],
  answer: 3,
  why: "The reader wrote that sentence. What is not handed to you is the second layer, and what the writer's choices reveal about how urgent they took the pressure to be.",
  whyNot: [
    "Skill 1.A is a reporting category on Question 2 — that is the one question where it is.",
    "It appears in Row B as well, which is where the explaining happens.",
    "A passage frequently makes its own exigence visible, and the prompt supplies the rest."
  ]
},
{
  id: "qz-rs-exigence-04",
  conceptId: "rs-exigence",
  source: "Skill 1.A",
  stem: "A commencement speech is delivered on the day a class graduates. Which of these is the **deeper** exigence?",
  options: [
    "The ceremony requires that somebody address the graduates",
    "The speaker has been asked to speak and has accepted",
    "The graduates are about to make a mistake the speaker can see",
    "The audience contains parents as well as students"
  ],
  answer: 2,
  why: "The deeper exigence is what makes this speech different from any other speech that could have filled the slot. It is the layer a rhetorical analysis can actually use.",
  whyNot: [
    "That is the immediate occasion — it explains a speech, not this speech.",
    "The invitation is a fact about the arrangement, not a pressure the text acts on.",
    "That is a feature of the audience, and belongs to a different component."
  ]
},

{
  id: "qz-rs-context-01",
  conceptId: "rs-context",
  source: "Skill 1.A",
  stem: "What does the CED say context includes?",
  options: [
    "Time, place and occasion",
    "The writer's biography and prior publications",
    "The audience's beliefs, values and needs",
    "The genre, the medium and the length"
  ],
  answer: 0,
  why: "Context is the set of circumstances the response has to work within — which is why it explains *constraint*, where exigence explains *that* a writer spoke.",
  whyNot: [
    "Biography belongs to the writer as a person, and the writer component asks about the version the text constructs.",
    "That is the audience component, stated almost in those words.",
    "Genre conventions are imposed by the occasion, so they are downstream of context rather than its definition."
  ]
},
{
  id: "qz-rs-context-02",
  conceptId: "rs-context",
  source: "Skill 1.A",
  stem: "Why is constraint the more useful half of context for analysis?",
  options: [
    "Because constraints can be verified historically, unlike an exigence",
    "Because a constraint makes a choice look like a decision rather than a preference",
    "Because the rubric awards a point for identifying a constraint",
    "Because constraints are always stated in the prompt's background"
  ],
  answer: 1,
  why: "If a speech is three minutes long at a burial, brevity is not a taste — it is the occasion setting a limit, and what the writer spends the three minutes on becomes readable as a decision.",
  whyNot: [
    "Both can be documented, and verifiability is not what makes a constraint analytically useful.",
    "No row awards a point for naming one; the credit comes from what you do with it.",
    "Prompts name the occasion, and the constraints it imposes are usually left for you to draw out."
  ]
},
{
  id: "qz-rs-context-03",
  conceptId: "rs-context",
  source: "Skill 1.A",
  stem: "Where does a writer's control end, and why does that matter for analysis?",
  options: [
    "At the audience: the writer selects the words but not who reads them",
    "At the genre: the writer selects the argument but not the form",
    "At the outcome: the writer selects the argument but not whether it works",
    "At the circumstances: the writer selects evidence and words, not the year or the venue"
  ],
  answer: 3,
  why: "Analysis is interesting exactly where a controllable choice meets an uncontrollable circumstance. That asymmetry is what makes a choice worth explaining rather than merely reporting.",
  whyNot: [
    "A writer does aim at an audience, and the incidental audience is a circumstance rather than the boundary itself.",
    "Genre is often chosen, and where it is imposed it is imposed by the occasion — that is, by context.",
    "True but not the point: the boundary that makes choices legible is between choice and circumstance, not between effort and result."
  ]
},
{
  id: "qz-rs-context-04",
  conceptId: "rs-context",
  source: "Skill 1.A",
  stem: "Why is ‘the context is the war’ a weak sentence in an essay on a wartime speech?",
  options: [
    "Because the war is the exigence rather than the context",
    "Because context should not be mentioned until the conclusion",
    "Because it parks context as background instead of using it to constrain a choice",
    "Because a war is too large an event to count as context"
  ],
  answer: 2,
  why: "Row C explicitly refuses the point where contextualising consists predominantly of sweeping generalisations. Context has to constrain a choice somewhere in the body of the essay, or it is decoration.",
  whyNot: [
    "A long-running war is the surrounding circumstance; the exigence is the particular occasion that produced this text on this date.",
    "There is no rule about where context may appear, and confining it to the conclusion would make it less useful still.",
    "Scale is not the problem — a large context can constrain a choice very precisely."
  ]
},

{
  id: "qz-rs-audience-01",
  conceptId: "rs-audience",
  source: "Skill 1.A",
  stem: "A speech is delivered to a hostile group but designed to move the undecided people listening in. Which term names the hostile group?",
  options: [
    "The addressed audience",
    "The intended audience",
    "The incidental audience",
    "The rhetorical audience"
  ],
  answer: 0,
  why: "Addressed is who the text speaks to directly; intended is who the writer actually wants to move. Naming the split is one of the more reliable ways to explain a choice that looks self-defeating if you assume a single audience.",
  whyNot: [
    "The intended audience here is the undecided listeners, who are the ones the speech is built to shift.",
    "The incidental audience is everyone else who hears it because of the occasion.",
    "This is not a term in use; the three-way split is addressed, intended and incidental."
  ]
},
{
  id: "qz-rs-audience-02",
  conceptId: "rs-audience",
  source: "Skill 1.A",
  stem: "The CED calls audiences **dynamic**. What does that mean for a writer?",
  options: [
    "That the audience may be replaced partway through a text",
    "That the audience is aiming at a moving target of its own",
    "That the audience the text ends with is not in the state it began in",
    "That audiences change from one decade to the next"
  ],
  answer: 2,
  why: "A text that works has moved them, so the writer is aiming at a target that shifts as the argument proceeds. It pairs with ‘unique’: you cannot import a generic audience from another text.",
  whyNot: [
    "Membership stays much the same; it is the audience's state that changes.",
    "This reverses the relationship — it is the writer who is aiming.",
    "That is true of audiences historically and is not what the term is picking out."
  ]
},
{
  id: "qz-rs-audience-03",
  conceptId: "rs-audience",
  source: "Skill 1.A",
  stem: "Why is answering ‘who is the audience’ with the room usually not analytical work on Question 2?",
  options: [
    "Because the room is only the incidental audience",
    "Because audience is not assessed on Question 2",
    "Because the room can never be established from the passage",
    "Because the prompt's background sentence has already handed you the room"
  ],
  answer: 3,
  why: "If your audience claim paraphrases the prompt, it adds nothing. The claim worth making is about what the writer *assumes* is true of that audience — which is readable from the page.",
  whyNot: [
    "The room is usually the addressed audience, and often the intended one too.",
    "Audience is part of the rhetorical situation and squarely in scope on that question.",
    "Prompts routinely establish it, which is exactly the difficulty."
  ]
},
{
  id: "qz-rs-audience-04",
  conceptId: "rs-audience",
  source: "Skill 1.A",
  stem: "What distinguishes an audience from a reader?",
  options: [
    "The reader is a single person; the audience is a group",
    "The reader is imagined; the audience is real",
    "The reader has the text in front of them",
    "The reader belongs to the present; the audience to the moment of writing"
  ],
  answer: 2,
  why: "You reading a speech in an exam decades later are a reader and were never the audience. The distinction is what stops an analysis drifting into what the text means to you.",
  whyNot: [
    "Both can be one person or many; number is not the criterion.",
    "Both are real, and the audience is often the more precisely specified of the two.",
    "Close, but incidental: a contemporary reader who was not aimed at is still not the audience."
  ]
},

{
  id: "qz-rs-writer-01",
  conceptId: "rs-writer",
  source: "Skill 1.A",
  stem: "The ‘writer’ component of the rhetorical situation asks you to look at what?",
  options: [
    "The writer's biography, training and prior commitments",
    "The version of themselves the text constructs",
    "The writer's stated intentions, where these are recorded",
    "The writer's reputation with the audience beforehand"
  ],
  answer: 1,
  why: "Credibility is not a possession the writer brings; it is an effect the text produces, and it is audience-relative. The same diction that establishes authority with one audience marks the writer as an outsider to another.",
  whyNot: [
    "Biography is outside the text, and an analysis built on it would predict the same choices in every text the writer ever produced.",
    "Stated intentions belong to purpose, and are rarely available in any case.",
    "Prior reputation is part of the context the text works within, not the writer the text builds."
  ]
},
{
  id: "qz-rs-writer-02",
  conceptId: "rs-writer",
  source: "Skill 1.A",
  stem: "Why does ‘Douglass was an abolitionist, so he uses strong language’ fail as analysis?",
  options: [
    "Because it names a device without explaining its effect",
    "Because it makes a claim about the audience rather than the writer",
    "Because it would predict identical language in every text he ever wrote",
    "Because the writer's politics are not part of the rhetorical situation"
  ],
  answer: 2,
  why: "It treats the writer as fixed and the text as a window onto them. The explanation should run the other way: this text builds this writer, for this audience, and the build changes when the audience does.",
  whyNot: [
    "No device is named, and the problem would remain if one were.",
    "The claim is about the writer throughout; that is what makes it inert.",
    "Politics can matter — but as something the text negotiates, not as a cause that explains its style."
  ]
},
{
  id: "qz-rs-writer-03",
  conceptId: "rs-writer",
  source: "Skill 1.A",
  stem: "Which of these is a countable move by which a text constructs its writer?",
  options: [
    "Being widely known for expertise in the subject under discussion",
    "Publishing in a venue the audience already trusts",
    "Holding views the audience is likely to find congenial",
    "Choosing ‘we’ over ‘I’, to enrol the audience in the writer's position"
  ],
  answer: 3,
  why: "The moves are small and countable, which is what makes them good essay material: conceding early to buy trust for a harder claim later, naming a personal experience to license a general claim, or declining to name one so the claim rests on evidence.",
  whyNot: [
    "Prior expertise is a fact about the person, and it is available to the text only if the text invokes it.",
    "The venue is part of the context the writer works within.",
    "Shared views are a feature of the audience, not a move made in the text."
  ]
},
{
  id: "qz-rs-writer-04",
  conceptId: "rs-writer",
  source: "Skill 1.A",
  stem: "Will the exam ask you to name the strategy by which a writer builds credibility?",
  options: [
    "Yes, since the terms appear in the course framework",
    "Yes, but only in the multiple-choice section",
    "No — it will ask what the choice accomplishes",
    "No, because credibility is assessed only in Row C"
  ],
  answer: 2,
  why: "The CED treats these under the rhetorical situation rather than as a vocabulary list, and says the exam emphasises the appropriate application of terminology rather than knowledge of it.",
  whyNot: [
    "Terms appear in the framework as the teacher's vernacular, which the CED distinguishes from what students are examined on.",
    "The same emphasis applies in both sections.",
    "Credibility can figure in any row; the reason naming is not asked for is different."
  ]
},

{
  id: "qz-rs-purpose-01",
  conceptId: "rs-purpose",
  source: "Skill 1.A",
  stem: "Which test tells you whether a statement of purpose is specific enough?",
  options: [
    "Whether it can be quoted from the text",
    "Whether it names a genre the text belongs to",
    "Whether you can state what would count as failure",
    "Whether it fits into a single sentence"
  ],
  answer: 2,
  why: "‘To persuade the audience’ fails the test, because its opposite is ‘not persuaded’, which is empty. A usable purpose has an opposite that is a real position somebody could hold.",
  whyNot: [
    "Quotation is the test for *message*, which can be paraphrased from the page; purpose has to be inferred.",
    "Naming a genre is what makes ‘to inform’ so weak an answer.",
    "Length has nothing to do with it — a vague purpose fits in a sentence very comfortably."
  ]
},
{
  id: "qz-rs-purpose-02",
  conceptId: "rs-purpose",
  source: "Skill 1.A",
  stem: "What does Q2 Row B require at three points, and what does it add at four?",
  options: [
    "A defensible thesis at three; a thesis that analyses choices at four",
    "Explaining how one rhetorical choice contributes at three",
    "Naming one rhetorical choice at three; naming several at four",
    "One piece of evidence at three; evidence from across the passage at four"
  ],
  answer: 1,
  why: "The requirement is countable rather than atmospheric, and purpose is the thing the choice must be connected *to*. A body paragraph that ends without reaching the purpose has not finished.",
  whyNot: [
    "The thesis requirements belong to Row A, which is worth one point.",
    "Naming is what the one-point decision rule describes; explaining is what earns three.",
    "Evidence matters in Row B, but the three-to-four step is about how many choices are explained."
  ]
},
{
  id: "qz-rs-purpose-03",
  conceptId: "rs-purpose",
  source: "Skill 1.A",
  stem: "A eulogy consoles the mourners in order to free them to act. What does that illustrate?",
  options: [
    "That a text may have a purpose its writer did not intend",
    "That consolation is a genre rather than a purpose",
    "That the audience's purpose may differ from the writer's",
    "That purposes are typically layered rather than parallel"
  ],
  answer: 3,
  why: "Multiple purposes are the norm. Where two are in tension — the writer must reassure and alarm at once — the tension is often the most analysable thing in the text, because every choice has to serve both.",
  whyNot: [
    "Both purposes here are the writer's, and both are intended.",
    "Consolation is something the writer wants to accomplish, which makes it a purpose.",
    "Audiences have interests rather than purposes in this framework."
  ]
},
{
  id: "qz-rs-purpose-04",
  conceptId: "rs-purpose",
  source: "Skill 1.A",
  stem: "Can a text that failed still be analysed for its purpose?",
  options: [
    "No, because purpose is defined by what the text achieved",
    "No, because a failed text has no measurable effect on its audience",
    "Yes — purpose is what the writer wanted",
    "Yes, but only if the writer recorded their intentions elsewhere"
  ],
  answer: 2,
  why: "Purpose and effect are different quantities. Analysing a failed text still means analysing what it was for, and the gap between aim and result is often where the interesting analysis is.",
  whyNot: [
    "Defining purpose by outcome would make every successful text purposeful and every failure purposeless.",
    "Effect is not the criterion, and a failed text can be very precisely aimed.",
    "External statements are rarely available and are not required; purpose is inferred from the situation."
  ]
},

{
  id: "qz-rs-message-01",
  conceptId: "rs-message",
  source: "Skill 1.A",
  stem: "What is the fastest test separating message from purpose?",
  options: [
    "The message is explicit; the purpose is always implicit",
    "The message can be quoted or paraphrased; the purpose has to be inferred",
    "The message belongs to the writer; the purpose belongs to the occasion",
    "The message changes between audiences; the purpose does not"
  ],
  answer: 1,
  why: "Message is on the page. Purpose is a fact about what the writer wanted the page to do, which the page can only imply.",
  whyNot: [
    "An ironic message is anything but explicit, and it is still the message.",
    "Both belong to the writer; the occasion supplies exigence and context.",
    "A writer may vary the message for different audiences precisely in order to hold the purpose steady."
  ]
},
{
  id: "qz-rs-message-02",
  conceptId: "rs-message",
  source: "Skill 1.A",
  stem: "Which selects which — does purpose select message, or message select purpose?",
  options: [
    "Purpose selects message",
    "Message selects purpose",
    "Neither: they are chosen independently",
    "The audience selects both"
  ],
  answer: 0,
  why: "A writer facing a hostile audience will not choose the most direct statement of their view, because directness is what gets rejected fastest. The aim comes first and the wording is fitted to it.",
  whyNot: [
    "This would make the writer's aim a consequence of their phrasing, which reverses the order of decision.",
    "They are tightly coupled: changing the audience changes the message while the purpose holds.",
    "The audience constrains the choice without making it."
  ]
},
{
  id: "qz-rs-message-03",
  conceptId: "rs-message",
  source: "Skill 1.A",
  stem: "Where do the most interesting rhetorical moves live, in message-and-purpose terms?",
  options: [
    "Where the message is stated most plainly",
    "Where the purpose is stated in the opening sentence",
    "Where message and purpose coincide exactly",
    "In the gap between them, where the writer says less or other than they mean"
  ],
  answer: 3,
  why: "Irony is the extreme case: the stated message is the opposite of the intended one, and the purpose depends on the audience detecting the gap. Understatement, concession and rhetorical questions are milder versions of the same mechanism.",
  whyNot: [
    "A plain statement leaves nothing for analysis to explain.",
    "A declared purpose is rare and, where it occurs, uninteresting to analyse.",
    "Exact coincidence is the case where the choice of wording carries the least information."
  ]
},
{
  id: "qz-rs-message-04",
  conceptId: "rs-message",
  source: "Skill 1.A",
  stem: "Your ‘message’ sentence could be replaced by ‘here is what the passage is about’. What have you written?",
  options: [
    "A thesis, which belongs in Row A rather than the body",
    "A summary, which the Row B decision rules price at one point",
    "A contextualising sentence, which belongs in Row C",
    "A claim, which now needs evidence attached to it"
  ],
  answer: 1,
  why: "The one-point descriptions on all three questions name the same failure: focusing on summary or description rather than on specific details or techniques. It is a summary wearing the vocabulary of analysis.",
  whyNot: [
    "A thesis makes a claim somebody could dispute, which this does not.",
    "Contextualising situates the argument in something broader; this stays inside the passage.",
    "A claim is disputable; ‘here is what it is about’ is not."
  ]
},

{
  id: "qz-rs-identify-vs-explain-01",
  conceptId: "rs-identify-vs-explain",
  source: "Q2 Row B",
  stem: "What do the Q2 Row B decision rules say about responses that earn one point?",
  options: [
    "They quote the passage without introducing the quotations",
    "They mention rhetorical choices with little or no explanation",
    "They analyse the passage but reach no defensible thesis",
    "They explain one choice but not its relation to the others"
  ],
  answer: 1,
  why: "That is device-listing, described exactly, and priced at one point out of four. The same responses tend to focus on summary or description rather than specific details or techniques.",
  whyNot: [
    "Quotation handling is not what the rule names.",
    "The thesis is Row A's business, and a response can miss it while scoring in Row B.",
    "That failure is Row C's, and it separates three-to-four-point work from the sophistication point."
  ]
},
{
  id: "qz-rs-identify-vs-explain-02",
  conceptId: "rs-identify-vs-explain",
  source: "Q2 Row B",
  stem: "Name the four rungs of the ladder from labelling to Row C analysis, in order.",
  options: [
    "Quote it; explain it; extend it; conclude from it",
    "Summarise; paraphrase; analyse; evaluate",
    "Name the choice; describe it",
    "Identify the device; define the device; find a second instance; generalise"
  ],
  answer: 2,
  why: "Row B lives on the third rung and Row C on the fourth: that row is refused to responses which examine individual choices but not the relationships among choices across the text.",
  whyNot: [
    "Quoting is a step inside the second rung rather than a rung of its own.",
    "These are reading operations rather than the rubric's ladder.",
    "Repeating an instance and generalising is what the fourth rung is not."
  ]
},
{
  id: "qz-rs-identify-vs-explain-03",
  conceptId: "rs-identify-vs-explain",
  source: "Q2 Row B",
  stem: "Apply the cover test to this sentence: ‘The writer uses a rhetorical question.’ What does it tell you?",
  options: [
    "It passes, because it identifies a technique accurately",
    "It passes, provided a quotation follows it",
    "It fails, because a rhetorical question is not a rhetorical choice",
    "It fails, because it could be true of a thousand other texts"
  ],
  answer: 3,
  why: "Cover the passage and read the sentence: if it could be true of a different text, it carries no information about this one. A sentence that could only be true here is one that has explained something.",
  whyNot: [
    "Accuracy is not the issue; the sentence is true and empty.",
    "A quotation would supply evidence and still leave the claim generic.",
    "It is a genuine rhetorical choice — the trouble is that naming it is not analysis."
  ]
},
{
  id: "qz-rs-identify-vs-explain-04",
  conceptId: "rs-identify-vs-explain",
  source: "Q2 Row B",
  stem: "Which phrase in your own draft signals that you are still on the naming rungs?",
  options: [
    "‘This shows that…’, followed by a claim about the writer's feelings",
    "‘In this passage…’, followed by a quotation",
    "‘The writer argues that…’, followed by a paraphrase",
    "‘For example…’, followed by a second instance"
  ],
  answer: 0,
  why: "If what follows is about the writer being passionate rather than about the audience being moved, the sentence is not doing rubric work. That is the tell of the device-list paragraph, which looks like analysis and is capped near one point.",
  whyNot: [
    "Locating a quotation is ordinary and harmless.",
    "Paraphrasing an argument is a step towards analysis rather than a symptom.",
    "A second instance can be exactly what a claim needs."
  ]
},

{
  id: "qz-rs-audience-model-01",
  conceptId: "rs-audience-model",
  source: "Skill 1.B",
  stem: "What is the strongest single piece of evidence for a writer's model of their audience?",
  options: [
    "The appeal the writer reaches for first",
    "The objection the writer concedes",
    "What the writer does not argue for",
    "The comparison the writer builds the argument on"
  ],
  answer: 2,
  why: "An unargued premise is one the writer expects to be granted, and expecting it to be granted is a claim about the audience. When a text asserts that a promise must be kept and moves straight on, it has told you what its audience holds as needing no defence.",
  whyNot: [
    "Which appeal comes first is good evidence, and it is the third-strongest of the four.",
    "The concession maps anticipated resistance, which makes it second-strongest.",
    "A comparison is the most legible bet of all about *familiarity*, and it ranks below the unargued premise."
  ]
},
{
  id: "qz-rs-audience-model-02",
  conceptId: "rs-audience-model",
  source: "Skill 1.B",
  stem: "Skill 1.B asks you to explain how an argument **demonstrates** understanding of an audience. Why does that verb matter?",
  options: [
    "Because it asks what the text shows the writer thought",
    "Because it requires evidence from outside the passage",
    "Because it limits the claim to arguments that succeeded",
    "Because it asks you to judge whether the understanding was correct"
  ],
  answer: 0,
  why: "You have the text; you do not have the room. Write that the passage treats something as needing no defence, which positions its audience as people who already hold it — rather than that the audience believed it.",
  whyNot: [
    "External evidence is not available in an exam and is not what the skill asks for.",
    "A misjudged argument demonstrates a model of its audience just as clearly.",
    "Correctness would be a historical question, and the wrong guess would take the whole paragraph down with it."
  ]
},
{
  id: "qz-rs-audience-model-03",
  conceptId: "rs-audience-model",
  source: "Skill 1.B",
  stem: "What does RHS-1.K make effectiveness of a comparison conditional on?",
  options: [
    "That the comparison be original rather than a familiar figure",
    "That the comparison be explained after it is introduced",
    "That the two things compared belong to the same category",
    "That the audience already shares and grasps what it is built from"
  ],
  answer: 3,
  why: "A comparison is an attempt to relate to an audience, so it advances the purpose only if the audience already holds the material it is made of. That is what makes it the most legible bet a writer places.",
  whyNot: [
    "Originality is a stylistic virtue and no part of the condition.",
    "Explaining a comparison usually signals that the writer expects it to miss.",
    "The interest of a metaphor is precisely that the categories differ."
  ]
},
{
  id: "qz-rs-audience-model-04",
  conceptId: "rs-audience-model",
  source: "Skill 1.B",
  stem: "Which sentence keeps the claim inside what the text can support?",
  options: [
    "The audience believed that hard work deserves reward",
    "The audience would have rejected any argument against reward",
    "The passage treats reward for hard work as needing no defence",
    "The writer knew the audience believed in reward for hard work"
  ],
  answer: 2,
  why: "The first is evidenced by the page in front of you; the others are guesses about a room you were not in. If the historical guess is wrong, everything built on it falls.",
  whyNot: [
    "This asserts a fact about people rather than about the text.",
    "This adds a prediction about their behaviour, which is further still from the evidence.",
    "This claims access to the writer's knowledge, which the text cannot supply."
  ]
},

{
  id: "qz-rs-appeals-01",
  conceptId: "rs-appeals",
  source: "Skill 1.B",
  stem: "What is the CED's stated position on rhetorical terminology?",
  options: [
    "Students should master a standard list of terms before the exam",
    "Terms belong to the teacher's vernacular rather than the students'",
    "Terms may be used in Row B but not in Row C",
    "Terms are required in a thesis on Question 2"
  ],
  answer: 1,
  why: "The exam has evolved to emphasise the appropriate application of such terminology rather than knowledge of it. Use the words if they shorten a sentence, and never let one stand as the claim.",
  whyNot: [
    "A student can learn two hundred terms and still not explain a choice, which is the reason for the CED's position.",
    "No row restricts vocabulary by name.",
    "Q2's thesis must address the writer's rhetorical choices, which does not require naming any device."
  ]
},
{
  id: "qz-rs-appeals-02",
  conceptId: "rs-appeals",
  source: "Skill 1.B",
  stem: "Which question turns an appeal from a label into analysis?",
  options: [
    "Which of the three classical appeals is it?",
    "How many times does the writer use it?",
    "What does the appeal cost the writer to use?",
    "Where in the passage does it first appear?"
  ],
  answer: 2,
  why: "Appeals have prices: an appeal to emotion risks looking manipulative, an appeal to authority risks looking distant, a concession spends ground to buy trust. Naming what a move risks is one of the more reliable ways to write about it as a decision.",
  whyNot: [
    "Classifying it is exactly the labelling step the concept is warning against.",
    "Frequency is a count, and a count explains nothing on its own.",
    "Position can matter, but locating a move is not the same as explaining it."
  ]
},
{
  id: "qz-rs-appeals-03",
  conceptId: "rs-appeals",
  source: "Skill 1.B",
  stem: "What is wrong with organising a rhetorical analysis as one paragraph each on ethos, pathos and logos?",
  options: [
    "The three appeals are not named in the CED",
    "Three paragraphs is too few for a forty-minute essay",
    "The appeals overlap, so the paragraphs would repeat each other",
    "The structure is imposed on the text rather than derived from it"
  ],
  answer: 3,
  why: "Row B rewards evidence supporting all claims in a line of reasoning, and a line of reasoning is an argument about this passage — not three predetermined buckets that would fit any passage at all.",
  whyNot: [
    "Appeals are named in the framework, as one example of the features that make language perform social action.",
    "Paragraph count is not assessed anywhere in the rubric.",
    "Overlap is real and is a symptom rather than the objection."
  ]
},
{
  id: "qz-rs-appeals-04",
  conceptId: "rs-appeals",
  source: "Skill 1.B",
  stem: "‘This is an appeal to pathos, which makes the audience feel emotional.’ What is the defect?",
  options: [
    "The term is applied to the wrong kind of evidence",
    "The second clause restates the first in different words",
    "The sentence lacks a quotation to support it",
    "The claim belongs in the introduction rather than the body"
  ],
  answer: 1,
  why: "If the sentence after your label could be deleted without loss, the label was the whole paragraph. The test is whether the second clause says anything the first did not.",
  whyNot: [
    "The classification may well be accurate, which is what makes the sentence feel like analysis.",
    "Adding a quotation would leave the same empty restatement in place.",
    "Position is not the problem; the sentence would be equally inert anywhere."
  ]
},

{
  id: "qz-rs-writing-to-audience-01",
  conceptId: "rs-writing-to-audience",
  source: "Skill 2.B",
  stem: "What are the two failures on either side of skill 2.B, and what do they share?",
  options: [
    "Over-quoting and under-quoting; both crowd out commentary",
    "Ignoring the audience and pandering to it",
    "Conceding too early and conceding too late; both weaken the thesis",
    "Writing too formally and too casually; both misjudge the occasion"
  ],
  answer: 1,
  why: "Arguing as though the audience already agreed, and telling them what they already believe, produce the same essay: one in which no claim is at risk.",
  whyNot: [
    "Quotation balance is a Row B matter and not the axis this skill runs along.",
    "Concession timing is a tactic within the skill rather than a failure either side of it.",
    "Register is worth getting right and is not what 2.B is about."
  ]
},
{
  id: "qz-rs-writing-to-audience-02",
  conceptId: "rs-writing-to-audience",
  source: "Skill 2.B",
  stem: "In the three-part shape of an argument that moves an audience, which part do students omit?",
  options: [
    "The premise the audience already grants",
    "The consequence they have not drawn",
    "The acknowledgement of what drawing it costs them",
    "The restatement of the thesis at the end"
  ],
  answer: 2,
  why: "A need is not the same as a belief. An audience may believe your claim and still need to be shown a way of accepting it that does not cost them their position.",
  whyNot: [
    "The shared premise is the easy part, and it is usually stated without defence.",
    "The unfamiliar consequence is what students think the argument *is*.",
    "Restating a thesis is not one of the three parts, and adds nothing to any row."
  ]
},
{
  id: "qz-rs-writing-to-audience-03",
  conceptId: "rs-writing-to-audience",
  source: "Skill 2.B",
  stem: "Why does ‘While some may argue that…’ followed by dismissal fail Row C?",
  options: [
    "Because the phrase is a cliché, and Row C rewards vivid style",
    "Because counterarguments belong in the introduction, not the body",
    "Because Row C requires two counterarguments rather than one",
    "Because Row C names it as only hinting at or suggesting other arguments"
  ],
  answer: 3,
  why: "All three Row C descriptors refuse the point to responses that only hint at other arguments, and print that phrasing as the example. A counterargument not stated in its strongest form is a gesture at having considered one.",
  whyNot: [
    "Style is a separate Row C route, and the objection here is about substance.",
    "There is no rule about where a counterargument goes.",
    "The number is not specified; the treatment is."
  ]
},
{
  id: "qz-rs-writing-to-audience-04",
  conceptId: "rs-writing-to-audience",
  source: "Skill 2.B",
  stem: "A metaphor drawn from something the audience does not know does not fail neutrally. What does it do?",
  options: [
    "It advertises that the writer has misjudged the audience",
    "It shifts the burden of explanation onto the next paragraph",
    "It reduces the essay's style score without affecting the argument",
    "It works anyway, provided the metaphor is explained"
  ],
  answer: 0,
  why: "Effectiveness is conditional on the audience already sharing and grasping what the comparison is built from. A comparison they cannot follow tells them something about the writer's model of them.",
  whyNot: [
    "The next paragraph cannot recover the impression already made.",
    "Style and argument are not separable here; the misjudgement is about the audience.",
    "Explaining a metaphor concedes that it did not land."
  ]
},

{
  id: "qz-rs-introductions-01",
  conceptId: "rs-introductions",
  source: "Skill 2.A",
  stem: "Where may the thesis appear, according to the rubrics' Additional Notes?",
  options: [
    "At the end of the first paragraph, by convention and requirement",
    "Anywhere in the response, and it may be more than one sentence",
    "In the introduction or the conclusion, but not the body",
    "Anywhere, provided it is a single sentence"
  ],
  answer: 1,
  why: "The notes add that the sentences must be in close proximity. Putting it at the end of paragraph one is a convention rather than a rule — a good one under time pressure, because it is hard to lose.",
  whyNot: [
    "The convention is real and is not a requirement.",
    "No such restriction exists; a thesis in the body is acceptable.",
    "More than one sentence is explicitly permitted."
  ]
},
{
  id: "qz-rs-introductions-02",
  conceptId: "rs-introductions",
  source: "Skill 2.A",
  stem: "Why do openings such as ‘Since the beginning of time…’ fail the Row C descriptors?",
  options: [
    "Because they are clichés, and clichés are penalised as style errors",
    "Because they delay the thesis past the first paragraph",
    "Because they are compatible with any essay on any subject",
    "Because historical claims cannot be verified in an exam"
  ],
  answer: 2,
  why: "The rows refuse the point where contextualising consists predominantly of sweeping generalisations, and print that opening as an example. A sentence compatible with any essay orients nobody.",
  whyNot: [
    "There is no penalty for a cliché as such; the objection is that it carries no information.",
    "Thesis placement is unrestricted, so delay is not the problem.",
    "Verification is not required of contextualising material."
  ]
},
{
  id: "qz-rs-introductions-03",
  conceptId: "rs-introductions",
  source: "Skill 2.A",
  stem: "Why is a five-sentence introduction a poor budget decision on a forty-minute essay?",
  options: [
    "Because Row A caps the introduction at three sentences",
    "Because readers stop reading after the first two sentences",
    "Because the reading period is meant to be used for the introduction",
    "Because it has spent Row B time on Row A work"
  ],
  answer: 3,
  why: "Row A is worth one point and Row B is worth four. The introduction's job is a defensible position — on Question 2, one that also analyses the writer's rhetorical choices — and everything past that is time taken from the body.",
  whyNot: [
    "No row limits sentence counts.",
    "Readers read the whole response; the objection is about where the marks are.",
    "The fifteen-minute reading period is for the sources and passages."
  ]
},
{
  id: "qz-rs-introductions-04",
  conceptId: "rs-introductions",
  source: "Skill 2.A",
  stem: "Why is ‘In this essay I will discuss three ways the writer persuades her audience’ a zero-point thesis on Question 2?",
  options: [
    "It states a plan rather than a claim about the writer's choices",
    "It uses the first person, which the rubric does not permit",
    "It commits to three points and so cannot be defended in forty minutes",
    "It names the audience without naming the purpose"
  ],
  answer: 0,
  why: "Row A refuses the point to a thesis that fails to address the rhetorical choices the writer makes, and a promise to discuss choices is not a claim about them. The fix is usually one word — replace *will discuss* with a verb that asserts something.",
  whyNot: [
    "The first person is not prohibited anywhere in the rubric.",
    "Three points is a perfectly ordinary scope for the time available.",
    "Naming neither would still leave the sentence a plan rather than a claim."
  ]
},

{
  id: "qz-rs-conclusions-01",
  conceptId: "rs-conclusions",
  source: "Skill 2.A",
  stem: "Which Row C route does a conclusion most naturally serve on Questions 1 and 3?",
  options: [
    "Employing a style that is consistently vivid and persuasive",
    "Articulating the implications or limitations of an argument",
    "Explaining the significance of the writer's rhetorical choices",
    "Providing evidence from more than three sources"
  ],
  answer: 1,
  why: "Note *limitations*. Saying where your argument stops holding is a route to the point, and it is the route that feels wrong to take, because naming a boundary looks like weakening the case. It is not: a bounded argument is a more precise one.",
  whyNot: [
    "Style is credited in all three rows and is not specific to the conclusion.",
    "That phrasing belongs to Question 2, whose Row C judges an analysis rather than a position.",
    "Source counts belong to Question 1's Row B."
  ]
},
{
  id: "qz-rs-conclusions-02",
  conceptId: "rs-conclusions",
  source: "Skill 2.A",
  stem: "Which conclusion move is described as the most reliable of the three?",
  options: [
    "Returning to the opening image and turning it",
    "Calling the reader to a specific action",
    "Widening once, into one named neighbouring case",
    "Summarising the body paragraphs in order"
  ],
  answer: 2,
  why: "One case, named — not ‘this applies to all of society’, which is the sweeping generalisation the rows refuse. Stating the boundary of the claim is the second move; turning the opening image is the third.",
  whyNot: [
    "Turning the image is the third of the three, and it only earns something when the image now means something different.",
    "A call to action is one of the things a conclusion may do, and it is not among the three that reliably do rubric work.",
    "Summary is what makes the restatement conclusion worth structurally nothing."
  ]
},
{
  id: "qz-rs-conclusions-03",
  conceptId: "rs-conclusions",
  source: "Skill 2.A",
  stem: "You are running out of time. Do you write the conclusion or finish the body paragraph?",
  options: [
    "The conclusion, because an unfinished essay reads as incomplete",
    "The conclusion, because Row C is the harder point to earn",
    "Whichever is shorter, since both carry a single point",
    "The body paragraph, because Row B is worth four points and Row C one"
  ],
  answer: 3,
  why: "The Row B Additional Notes bar the fourth point for grammatical or mechanical errors that interfere with communication — never for a missing conclusion. The arithmetic is not close.",
  whyNot: [
    "No row credits completeness of shape.",
    "Difficulty is not the criterion; the point values are.",
    "Row B carries four points, so the two are not equivalent."
  ]
},
{
  id: "qz-rs-conclusions-04",
  conceptId: "rs-conclusions",
  source: "Skill 2.A",
  stem: "Why can a restatement conclusion earn nothing at all?",
  options: [
    "Because it repeats the introduction, which the rubric penalises directly",
    "Because it adds nothing to Row B and is not part of the argument for Row C",
    "Because conclusions are not read when time has been called",
    "Because it usually contains mechanical errors made in haste"
  ],
  answer: 1,
  why: "Row B concerns evidence and commentary in the body, so a past-tense repeat adds nothing there; and Row C requires the sophistication to be part of the student's argument rather than a phrase or reference. It is the only paragraph in an essay that is worth structurally nothing.",
  whyNot: [
    "There is no penalty for repetition as such — the trouble is that it earns nothing.",
    "Everything written is read.",
    "Haste may produce errors, but a flawless restatement earns nothing either."
  ]
},

/* ---- Claims, evidence and the thesis -------------------------------------- */

{
  id: "qz-ce-claim-vs-fact-01",
  conceptId: "ce-claim-vs-fact",
  source: "Skill 3.A",
  stem: "What is the one-sentence test for whether something is a claim?",
  options: [
    "Check whether it contains an evaluative word such as ‘important'",
    "Check whether it appears in the first paragraph of the response",
    "Check whether a source could confirm or disconfirm it",
    "Write the opposite sentence and ask whether a thoughtful person could hold it"
  ],
  answer: 3,
  why: "If the opposite is obviously false or meaningless, you have a fact or an empty phrase. Confidence lives in you; defensibility lives in the sentence.",
  whyNot: [
    "Evaluative words are exactly how an empty sentence disguises itself as an argumentative one.",
    "Position in the essay has no bearing on whether a sentence is a claim.",
    "A sentence a source can settle is a statement of fact, which is the first family that fails the test."
  ]
},
{
  id: "qz-ce-claim-vs-fact-02",
  conceptId: "ce-claim-vs-fact",
  source: "Skill 3.A",
  stem: "Which of these fails the claim test, and for which reason?",
  options: [
    "‘I find libraries pleasant' — it reports an internal state nobody can dispute",
    "‘Libraries are worth funding for what they do for people with nowhere else to go'",
    "‘The fare rise shifted costs onto people without cars'",
    "‘Teenagers at this school sleep too little on school nights'"
  ],
  answer: 0,
  why: "A statement of private preference has no public content. Turn it outward and it becomes arguable — which is what the second option does with the same underlying feeling.",
  whyNot: [
    "This is the outward-facing version, and reasons bear on it directly.",
    "This contains no opinion word at all and is still a claim, because reasons bear on it.",
    "A narrowed scope makes a claim easier to defend and more interesting to read, not less of a claim."
  ]
},
{
  id: "qz-ce-claim-vs-fact-03",
  conceptId: "ce-claim-vs-fact",
  source: "Skill 3.A",
  stem: "Why does narrowing a claim's scope usually raise both its interest and its defensibility?",
  options: [
    "Because shorter claims are easier for a reader to remember",
    "Because a narrower claim has fewer counter-cases and more specific content",
    "Because the rubric awards a point for a narrowly stated position",
    "Because narrow claims can be settled by a single source"
  ],
  answer: 1,
  why: "‘Teenagers sleep too little' and ‘teenagers at this school sleep too little on school nights' are different claims with different defences, and the second is both safer and more informative. That is the opposite of the instinct to write big to sound impressive.",
  whyNot: [
    "Memorability is not what is at stake, and a narrow claim can be long.",
    "No row credits narrowness as such.",
    "A claim settled by a single source has become a statement of fact."
  ]
},
{
  id: "qz-ce-claim-vs-fact-04",
  conceptId: "ce-claim-vs-fact",
  source: "Skill 3.A",
  stem: "What is the commonest way students write a non-claim without noticing?",
  options: [
    "Writing a sentence that is factually wrong",
    "Writing a sentence that the sources contradict",
    "Writing a sentence too long for a single reading",
    "Writing a sentence that sounds argumentative but commits to nothing"
  ],
  answer: 3,
  why: "‘Libraries are important in many ways' contains evaluative words and asserts nothing anyone would deny. Ask what the opposing essay would say; if you cannot imagine anyone writing it, rewrite.",
  whyNot: [
    "A false claim is still a claim, and the rubric never penalises a position for being wrong.",
    "A contradicted claim is defensible in the rubric's sense — reasons bear on it.",
    "Length is a style matter and has nothing to do with defensibility."
  ]
},

{
  id: "qz-ce-evidence-01",
  conceptId: "ce-evidence",
  source: "Skill 3.A",
  stem: "What word carries the Q3 Row B evidence ladder from one point to two?",
  options: [
    "‘Relevant', separating evidence that bears on the claim from evidence that does not",
    "‘Specific', separating a named case from a general gesture such as ‘studies show'",
    "‘Sufficient', separating enough evidence from too little",
    "‘Embedded', separating quotation built into a sentence from quotation dropped in"
  ],
  answer: 1,
  why: "One point is described as evidence that is mostly general; two points as some specific, relevant evidence. A named case, a dated event, an exact phrase or a figure is specific — ‘studies show' is general however true it is.",
  whyNot: [
    "Relevance appears at two points as well, but the step up from one is carried by specificity.",
    "Sufficiency is a separate idea, judged against how strong the claim is.",
    "Embedding is a paragraph-craft matter and is not a Row B ladder rung."
  ]
},
{
  id: "qz-ce-evidence-02",
  conceptId: "ce-evidence",
  source: "Skill 3.A",
  stem: "On Question 1, what is the minimum number of provided sources a response must use to be eligible for two or more Row B points?",
  options: [
    "Two",
    "Four",
    "Three",
    "All of the provided sources"
  ],
  answer: 2,
  why: "Zero points if the response references fewer than two; one point needs at least two; the two-, three- and four-point rows all require at least three. It is the one place in the whole rubric where a number rather than a judgement caps your score.",
  whyNot: [
    "Two is the threshold for a single point, not for two.",
    "Four is more than the rubric asks for anywhere.",
    "No row requires every source."
  ]
},
{
  id: "qz-ce-evidence-03",
  conceptId: "ce-evidence",
  source: "Skill 3.A",
  stem: "You cannot recall a statistic for the Argument essay. What follows?",
  options: [
    "Nothing — anecdotes and personal experience are on the CED's list of evidence types",
    "You must select a different prompt position that needs no data",
    "You should approximate the statistic and mark it as approximate",
    "You should argue from reasoning alone, since evidence is optional on Q3"
  ],
  answer: 0,
  why: "A precisely told incident from your own life, used to support a stated claim and explained, is evidence. A half-remembered statistic is not better for being numerical.",
  whyNot: [
    "Prompts do not offer alternative positions, and the difficulty would follow you to any of them.",
    "An invented figure is worse than no figure, and marking it as approximate does not repair it.",
    "Some claims are carried by reasoning, but Row B grades evidence and commentary together."
  ]
},
{
  id: "qz-ce-evidence-04",
  conceptId: "ce-evidence",
  source: "Skill 3.A",
  stem: "On Question 2, what is the evidence made of?",
  options: [
    "Historical facts about the occasion on which the passage was delivered",
    "Named rhetorical devices, identified accurately from the passage",
    "The passage itself — its exact words, sentence shapes and ordering",
    "Comparable passages by the same writer or from the same period"
  ],
  answer: 2,
  why: "Quoting three words precisely is evidence; retelling a paragraph is not. Everything you need is on the page, which is why specificity there is the whole of the evidence requirement.",
  whyNot: [
    "The occasion is context, supplied by the prompt, and it is not what a claim about a choice rests on.",
    "A device name is a label, and the decision rules price naming without explanation at one point.",
    "Nothing outside the passage is available in the exam or expected."
  ]
},

{
  id: "qz-ce-evidence-vs-example-01",
  conceptId: "ce-evidence-vs-example",
  source: "Skill 4.A",
  stem: "What is the diagnostic that separates illustration from support?",
  options: [
    "Ask whether the material is quoted or paraphrased",
    "Ask whether the material comes from a provided source",
    "Ask whether the material appears before or after the claim",
    "Ask whether the opposing side could use the same material"
  ],
  answer: 3,
  why: "‘In 2018 several cities adopted ranked-choice voting' can be used by either side, so it illustrates rather than supports. ‘In the cities that adopted it, turnout rose in the following election' cannot be taken by the opposition, because it bears on the disputed point.",
  whyNot: [
    "Form of citation is independent of whether the material bears on the claim.",
    "Provided sources can supply illustration just as easily as support.",
    "Order within the paragraph does not change what the material does."
  ]
},
{
  id: "qz-ce-evidence-vs-example-02",
  conceptId: "ce-evidence-vs-example",
  source: "Skill 4.A",
  stem: "Is ‘example' a different category from ‘evidence' in the CED?",
  options: [
    "No — examples are listed among the types of evidence",
    "Yes — examples illustrate and evidence proves",
    "Yes — examples are permitted on Q3 but not on Q1",
    "No — the CED uses ‘example' only for the rubric's own samples"
  ],
  answer: 0,
  why: "The distinction is between two *uses* of the same material: illustrating what you mean, versus giving a reader a reason to believe you. The error is not using an example; it is using one in the slot where the argument needed support and then moving on.",
  whyNot: [
    "That is the distinction between two uses, not between two categories in the CED's list.",
    "No question restricts the type of evidence in that way.",
    "The word appears in the list of evidence types under CLE-1.C."
  ]
},
{
  id: "qz-ce-evidence-vs-example-03",
  conceptId: "ce-evidence-vs-example",
  source: "Skill 4.A",
  stem: "Why is ‘for example' called the most dangerous transition in the essay?",
  options: [
    "Because it is informal, and the rubric expects academic register",
    "Because writing it satisfies the feeling of having supported something",
    "Because it signals that the writer has run out of sources",
    "Because it introduces material the opposing side could also use"
  ],
  answer: 1,
  why: "Illustration feels like work and requires no commitment. The fix is to force a sentence after it beginning ‘which matters because' — and if you cannot finish that sentence, the example was decoration.",
  whyNot: [
    "Register is not assessed, and the phrase is perfectly ordinary academic English.",
    "It says nothing about how many sources are left.",
    "That is true of a badly chosen example and not of the transition itself."
  ]
},
{
  id: "qz-ce-evidence-vs-example-04",
  conceptId: "ce-evidence-vs-example",
  source: "Skill 4.A",
  stem: "On Question 1, what moves a response from one Row B point to two?",
  options: [
    "Moving from general evidence to specific, relevant evidence",
    "Adding commentary that explains how the evidence supports the argument",
    "Referencing at least three of the provided sources rather than two",
    "Stating a defensible thesis in the opening paragraph"
  ],
  answer: 2,
  why: "Q1's one-to-two gate is a count of sources, not a judgement of specificity — which is what makes it different from Q2 and Q3, where that step is carried by the word ‘specific'.",
  whyNot: [
    "That is the Q2 and Q3 gate; Q1's is mechanical.",
    "Commentary quality carries the steps above two, not this one.",
    "The thesis is Row A's business and does not affect Row B."
  ]
},

{
  id: "qz-ce-subclaims-01",
  conceptId: "ce-subclaims",
  source: "Skill 3.A",
  stem: "Can the same sentence be a claim in one place and evidence in another?",
  options: [
    "No — grammar fixes which one a sentence is",
    "No — a sentence is evidence only if it cites a source",
    "Yes — position in the argument decides, not grammar",
    "Yes, but only in the synthesis essay, where sources overlap"
  ],
  answer: 2,
  why: "A sentence the writer spends a paragraph establishing is a claim; the same sentence treated as settled and used to argue for something else is evidence. That is why memorising a list of ‘claim words' does not work, and why the reading sets ask what a sentence *does*.",
  whyNot: [
    "No grammatical feature marks the difference — that is precisely the trouble with word lists.",
    "Citation marks where material came from, not what job it is doing.",
    "The same shift happens in any argument, including a single-passage one."
  ]
},
{
  id: "qz-ce-subclaims-02",
  conceptId: "ce-subclaims",
  source: "Skill 3.A",
  stem: "In the three-step procedure for taking an argument apart, how do you find the thesis?",
  options: [
    "It is the sentence that all the other claims are serving",
    "It is the first claim stated in the passage",
    "It is the claim with the most evidence attached to it",
    "It is the sentence the writer repeats most often"
  ],
  answer: 0,
  why: "Find the sentences that would still need defending if the surrounding paragraphs were removed; list what was put beside each to make you accept it; then ask which one all the rest are serving.",
  whyNot: [
    "A writer may lead through the reasoning and arrive at the thesis at the end.",
    "A sub-claim can carry more evidence than the thesis it supports.",
    "Repetition is a style choice and is distributed across claims and evidence alike."
  ]
},
{
  id: "qz-ce-subclaims-03",
  conceptId: "ce-subclaims",
  source: "Skill 3.A",
  stem: "Asked to identify a claim in a passage, students often pick the most emphatic-sounding sentence. Why does that fail?",
  options: [
    "Because emphatic sentences are usually the writer's counterargument",
    "Because emphasis is a style choice, distributed across claims and evidence alike",
    "Because claims are typically the least emphatic sentences in a passage",
    "Because emphasis marks the thesis rather than a sub-claim"
  ],
  answer: 1,
  why: "Pick by function instead: what is this sentence asking me to accept, and what is it offering in exchange?",
  whyNot: [
    "Counterarguments are sometimes emphatic and sometimes not; there is no such rule.",
    "Claims are often emphatic; the point is that emphasis does not identify them.",
    "The thesis may be stated very quietly, or not stated at all."
  ]
},
{
  id: "qz-ce-subclaims-04",
  conceptId: "ce-subclaims",
  source: "Skill 3.A",
  stem: "What makes a sub-claim a sub-claim rather than a thesis?",
  options: [
    "It has less evidence attached to it than the thesis does",
    "It appears later in the text than the thesis",
    "It is stated in a body paragraph rather than an introduction",
    "Its purpose is to make the overarching claim more believable"
  ],
  answer: 3,
  why: "A sub-claim is a full claim in its own right, with its own evidence. What distinguishes it is function, not size or position.",
  whyNot: [
    "It may carry more evidence than the thesis, which is often asserted rather than proved directly.",
    "A thesis may arrive at the very end, after every sub-claim.",
    "Placement follows the reasoning and does not decide the category."
  ]
},

{
  id: "qz-ce-evidence-sufficiency-01",
  conceptId: "ce-evidence-sufficiency",
  source: "Skill 3.A",
  stem: "Sufficiency of evidence is judged relative to what?",
  options: [
    "The strength of the claim it is supporting",
    "The number of sources the question provides",
    "The length of the response",
    "The time available for the essay"
  ],
  answer: 0,
  why: "‘This policy always fails' cannot be sufficiently evidenced, because one counter-case sinks it. ‘This policy has failed wherever it was tried without funding' may need only two cases. You adjust the claim as well as the evidence, and the CED treats that as a skill.",
  whyNot: [
    "Source counts set an eligibility threshold on Question 1 and do not define sufficiency.",
    "A long response can leave every claim under-supported.",
    "The clock constrains what you can write and not what the claim requires."
  ]
},
{
  id: "qz-ce-evidence-sufficiency-02",
  conceptId: "ce-evidence-sufficiency",
  source: "Skill 3.A",
  stem: "Why does a single unsupported claim cap Row B at two points?",
  options: [
    "Because the decision rules require evidence in every paragraph",
    "Because the three-point row requires evidence supporting **all** claims in a line of reasoning",
    "Because an unsupported claim is treated as a summary",
    "Because the reader stops crediting evidence after the first gap"
  ],
  answer: 1,
  why: "‘All' is literal. One claim left bare blocks the row however good the other paragraphs are — which is an argument for having fewer claims, well supported, rather than more.",
  whyNot: [
    "The rubric speaks of claims rather than paragraphs, and a paragraph may carry none.",
    "Summary is a separate failure, described in the commentary column.",
    "Readers score the whole response against the criteria."
  ]
},
{
  id: "qz-ce-evidence-sufficiency-03",
  conceptId: "ce-evidence-sufficiency",
  source: "Skill 3.A",
  stem: "What distinction does the CED draw between a position and a perspective?",
  options: [
    "A position is stated; a perspective is implied",
    "A position belongs to a source; a perspective belongs to a writer",
    "A position can be defended; a perspective can only be described",
    "Sources can share a position while coming from different perspectives"
  ],
  answer: 3,
  why: "Perspective is shaped by background, interests and expertise. Agreement across different perspectives is worth more than agreement within one — which is why independence of evidence matters as much as quantity.",
  whyNot: [
    "Both can be stated or implied.",
    "Both belong to whoever holds them.",
    "A perspective can certainly be defended, and often is."
  ]
},
{
  id: "qz-ce-evidence-sufficiency-04",
  conceptId: "ce-evidence-sufficiency",
  source: "Skill 3.A",
  stem: "A response quotes a third source once, in passing, in its conclusion. What does that achieve on Question 1?",
  options: [
    "It clears the counting threshold and nothing above one point",
    "It earns the full four points, since three sources are used",
    "It earns nothing, since sources in a conclusion are not counted",
    "It earns the sophistication point for widening the argument"
  ],
  answer: 0,
  why: "The rubric counts sources for eligibility and grades commentary for the points above one. A source referenced and not explained gets you over the threshold and no further.",
  whyNot: [
    "Eligibility is not the same as achievement; the commentary column still has to be climbed.",
    "Placement is not restricted, so the reference does count.",
    "Row C requires the sophistication to be part of the argument, which a passing reference is not."
  ]
},

{
  id: "qz-ce-thesis-01",
  conceptId: "ce-thesis",
  source: "Skill 3.B",
  stem: "What is the difference between a thesis and a thesis statement?",
  options: [
    "A thesis is the writer's; a thesis statement is the reader's reconstruction",
    "Every argument has a thesis; only some state it outright",
    "A thesis is one sentence; a thesis statement may be several",
    "A thesis is arguable; a thesis statement summarises the argument"
  ],
  answer: 1,
  why: "The thesis is the main overarching claim, whether or not it appears on the page. When it is directly expressed, that sentence is the thesis statement — and on the exam your own essays must express it.",
  whyNot: [
    "A reconstruction is what a reader produces when the writer left the thesis unstated; it is not the definition.",
    "Length is not what separates them; a thesis statement may be more than one sentence.",
    "Both are the same claim; only their expression differs."
  ]
},
{
  id: "qz-ce-thesis-02",
  conceptId: "ce-thesis",
  source: "Skill 3.B",
  stem: "Must your own exam essays state the thesis explicitly?",
  options: [
    "No — a thesis a reader can reconstruct earns the point",
    "No, provided the line of reasoning arrives at it",
    "Yes — the CED requires clear communication of the thesis in students' essays",
    "Yes, but only on Question 2, where the choices must be named"
  ],
  answer: 2,
  why: "Whatever a published writer may get away with, the exam requires it — and the decision rules refuse the point where the position is vague or must be inferred. Reading rewards inference; writing forbids relying on it.",
  whyNot: [
    "Reconstruction is the reading task, and the reader is not required to do it for you.",
    "Arriving at the thesis is a legitimate structure, and the thesis still has to be stated when you arrive.",
    "The requirement holds on all three essays."
  ]
},
{
  id: "qz-ce-thesis-03",
  conceptId: "ce-thesis",
  source: "Skill 3.B",
  stem: "On Question 2, what is the difference between the passage's thesis and your thesis?",
  options: [
    "The passage's thesis is explicit; yours may be implied",
    "The passage's thesis is what the writer argues",
    "The passage's thesis is one sentence; yours may run to several",
    "There is none — a rhetorical analysis restates the passage's thesis"
  ],
  answer: 1,
  why: "Confusing them is the standard way to lose Row A on that question, which refuses the point to responses that fail to address the rhetorical choices the writer makes.",
  whyNot: [
    "Yours must be explicit, and the passage's may well be implied.",
    "Length is not the distinction, and both may run to several sentences.",
    "Restating the passage's thesis is exactly the failure the row describes."
  ]
},
{
  id: "qz-ce-thesis-04",
  conceptId: "ce-thesis",
  source: "Skill 3.B",
  stem: "The CED names two orders in which a thesis can appear. What decides which suits a text?",
  options: [
    "The length of the text, since long arguments need early signposting",
    "The genre, since speeches state the claim first and essays do not",
    "The evidence available, since strong evidence permits an early claim",
    "The audience, since delaying the claim suits a hostile one"
  ],
  answer: 3,
  why: "Leading the reader through the reasoning and arriving at the thesis buys assent by delaying the point of disagreement. Stating the claim first is clearer for a reader already sympathetic or in a hurry. Neither is better in the abstract.",
  whyNot: [
    "Long arguments are found in both orders.",
    "Neither genre is committed to either order.",
    "Evidence strength affects what you can prove, not where the claim sits."
  ]
},

{
  id: "qz-ce-defensible-thesis-01",
  conceptId: "ce-defensible-thesis",
  source: "Skill 4.B",
  stem: "How does the Q2 Row A one-point descriptor differ from Q1's and Q3's?",
  options: [
    "Q2 requires a defensible thesis that analyses the writer's rhetorical choices",
    "Q2 requires the thesis to appear in the opening paragraph",
    "Q2 requires the thesis to preview the structure of the essay",
    "Q2 requires the thesis to name at least one rhetorical device"
  ],
  answer: 0,
  why: "Q1 and Q3 are word-for-word identical to each other. Q2 adds a requirement no amount of defensibility replaces: a perfectly arguable thesis about whether the passage's writer was *right* earns nothing there.",
  whyNot: [
    "Placement is unrestricted on all three questions.",
    "Previewing is optional everywhere, and the notes say so explicitly.",
    "Naming a device is never required, and naming without explaining is a one-point pattern in Row B."
  ]
},
{
  id: "qz-ce-defensible-thesis-02",
  conceptId: "ce-defensible-thesis",
  source: "Skill 4.B",
  stem: "Your essay collapses after a strong opening. What happens to the thesis point?",
  options: [
    "It is withdrawn, because the thesis was not supported",
    "It is halved, since Row A is scored proportionally",
    "It is kept, because Row A is judged on the thesis alone",
    "It is kept only if the collapse happens after the second body paragraph"
  ],
  answer: 2,
  why: "The Additional Notes are explicit: a thesis meeting the criteria earns the point whether or not the rest of the response successfully supports that line of reasoning.",
  whyNot: [
    "Support is Row B's business, and the rows are scored independently.",
    "Row A is binary — one point or none.",
    "No such condition exists anywhere in the rubric."
  ]
},
{
  id: "qz-ce-defensible-thesis-03",
  conceptId: "ce-defensible-thesis",
  source: "Skill 4.B",
  stem: "Which Row A Additional Note appears on Questions 1 and 2 but not on Question 3, and why?",
  options: [
    "That the thesis may be more than one sentence, since Q3 allows only one",
    "That the thesis may appear anywhere, since Q3 requires it early",
    "That an elegant thesis and a blunt one score the same, since Q3 rewards style",
    "That the sources or passage must contain minimal supporting evidence"
  ],
  answer: 3,
  why: "On the Argument essay your defensibility is bounded only by what a reasonable person could argue, because there is no provided material for a position to be checked against.",
  whyNot: [
    "The multiple-sentence note appears on all three.",
    "So does the note that the thesis may appear anywhere.",
    "Row A is binary on all three, and style is a Row C route."
  ]
},
{
  id: "qz-ce-defensible-thesis-04",
  conceptId: "ce-defensible-thesis",
  source: "Skill 4.B",
  stem: "Why is spending eight minutes perfecting the thesis a poor trade?",
  options: [
    "Because Row A is binary: a blunt defensible thesis scores the same as an elegant one",
    "Because a polished thesis is more likely to over-commit the argument",
    "Because the thesis may be revised later, so early polish is wasted",
    "Because readers score Row A before reading the body"
  ],
  answer: 0,
  why: "Get a defensible sentence down in two minutes and spend the recovered six on Row B, which is worth four points.",
  whyNot: [
    "Over-commitment is a real risk and not the reason the trade is bad.",
    "Revision is possible and is not what makes the eight minutes expensive.",
    "The order in which rows are scored has no bearing on how you should spend the time."
  ]
},

{
  id: "qz-ce-thesis-zero-01",
  conceptId: "ce-thesis-zero",
  source: "Q1 Row A",
  stem: "Which decision-rule failure describes a response containing a real position that the reader must assemble from scattered sentences?",
  options: [
    "‘Only restate the prompt'",
    "‘State an obvious fact rather than making a claim that requires a defense'",
    "‘Do not take a position, or the position is vague or must be inferred'",
    "‘Equivocate or summarize other's arguments but not the student's'"
  ],
  answer: 2,
  why: "‘Must be inferred' is the sharpest of the four, because it fails a response that really does hold a position. The reader is not required to construct your thesis for you.",
  whyNot: [
    "Restating the prompt is a different failure, and it produces no position at all.",
    "An obvious fact is a closed sentence rather than a scattered one.",
    "Equivocation surveys other people's positions without adopting one."
  ]
},
{
  id: "qz-ce-thesis-zero-02",
  conceptId: "ce-thesis-zero",
  source: "Q1 Row A",
  stem: "Can a thesis the reader thinks is false still earn the Row A point?",
  options: [
    "Yes — nothing in the criteria concerns the truth of the position",
    "No — a thesis contradicted by the sources is not defensible",
    "Yes, provided the essay concedes the opposing view",
    "No — Row A requires the position to be supportable from the provided material"
  ],
  answer: 0,
  why: "The criteria concern whether a defensible position was stated in response to the prompt. Defensible means reasons could bear on it, not that the reader agrees.",
  whyNot: [
    "Contradiction by a source makes a claim contested, which is what a claim is for.",
    "Concession is a Row C route and changes nothing in Row A.",
    "Q1 and Q2 require only minimal supporting evidence to exist, not that the reader find the position convincing."
  ]
},
{
  id: "qz-ce-thesis-zero-03",
  conceptId: "ce-thesis-zero",
  source: "Q1 Row A",
  stem: "Why is the equivocation failure described as a **trained** habit?",
  options: [
    "Because it is produced by nerves rather than by instruction",
    "Because many students are taught to open by surveying both sides",
    "Because it is the natural result of running out of time",
    "Because it is copied from the rubric's own sample responses"
  ],
  answer: 1,
  why: "The survey feels balanced and mature, and on this rubric a survey with no position attached is a zero. Present the other side by all means, then say which side you are on, in the same breath.",
  whyNot: [
    "Nerves produce hedging, which is a different failure.",
    "It usually appears in the introduction, written before time is short.",
    "The rubric's samples of this pattern are examples of what does *not* earn the point."
  ]
},
{
  id: "qz-ce-thesis-zero-04",
  conceptId: "ce-thesis-zero",
  source: "Q1 Row A",
  stem: "Why is a safe, hedged thesis a bad way to avoid being marked wrong?",
  options: [
    "Because hedged theses are harder to support with evidence",
    "Because the rubric requires a thesis to be original",
    "Because hedging trades a risk that does not exist for one that does",
    "Because Row C penalises hedging as oversimplification"
  ],
  answer: 2,
  why: "The rubric never penalises a position for being unpopular, and it explicitly penalises positions that are vague or must be inferred. The risk you were avoiding was not there; the one you took on is.",
  whyNot: [
    "They are, but that is a consequence rather than the reason the strategy is unsound.",
    "Originality is nowhere required.",
    "Row C's oversimplification exclusion belongs to Question 2 and concerns the text's complexities."
  ]
},

{
  id: "qz-ce-preview-structure-01",
  conceptId: "ce-preview-structure",
  source: "Skill 4.B",
  stem: "Does previewing the argument's structure earn the Row A point?",
  options: [
    "No — the notes say a thesis need not establish a line of reasoning to earn the point",
    "Yes — previewing is half of Skill 4.B and is therefore required",
    "Yes on Q1 and Q3, where structure is assessed, but not on Q2",
    "No — previewing is explicitly penalised as a formula"
  ],
  answer: 0,
  why: "Any benefit is indirect, through Row B: a preview functions as a plan you cannot lose. The corresponding statement adds that a thesis need not list the points, aspects or evidence to come.",
  whyNot: [
    "Skill 4.B makes requiring defence compulsory and previewing optional.",
    "No row credits previewing on any question.",
    "It is permitted, not penalised — the trouble is only that it earns nothing directly."
  ]
},
{
  id: "qz-ce-preview-structure-02",
  conceptId: "ce-preview-structure",
  source: "Skill 4.B",
  stem: "What distinguishes previewing reasoning from listing topics?",
  options: [
    "Reasoning previews are longer and use subordinate clauses",
    "Reasoning previews name steps, each of which a paragraph can defend",
    "Reasoning previews appear in the conclusion rather than the introduction",
    "Reasoning previews avoid naming any rhetorical device"
  ],
  answer: 1,
  why: "‘The speaker uses anecdote, repetition and rhetorical questions' tells the reader your paragraph order and nothing else, and quietly commits you to a device-hunt. A preview of steps commits you to claims instead.",
  whyNot: [
    "Length and syntax are incidental; a short preview can name steps.",
    "Both normally appear in the introduction.",
    "Naming a device is not the problem — leaving it unexplained is."
  ]
},
{
  id: "qz-ce-preview-structure-03",
  conceptId: "ce-preview-structure",
  source: "Skill 4.B",
  stem: "Why does the formula ‘X, because A, B and C' cap a response?",
  options: [
    "Because it names three reasons, and the rubric requires four claims",
    "Because it places the thesis too early for a hostile audience",
    "Because it tends to produce parallel paragraphs with no progression between them",
    "Because it commits the writer to evidence from three separate sources"
  ],
  answer: 2,
  why: "The Row B decision rules describe two-point responses as ones that do not explain the connections or progression between the claims, so no line of reasoning is established. If you use the formula, make A, B and C *steps* rather than three separate reasons.",
  whyNot: [
    "No row specifies a number of claims.",
    "Early placement is a legitimate structure and is not what caps the score.",
    "Only Question 1 counts sources, and the formula implies nothing about them."
  ]
},
{
  id: "qz-ce-preview-structure-04",
  conceptId: "ce-preview-structure",
  source: "Skill 4.B",
  stem: "On the reading side, what can a thesis sentence's structural signals tell you?",
  options: [
    "A plural noun promises parallel sections",
    "A long sentence promises a long argument; a short one promises brevity",
    "A quotation promises a source-based argument; its absence promises reasoning alone",
    "A question promises an inductive structure; a statement promises a deductive one"
  ],
  answer: 0,
  why: "A causal connective promises a mechanism. Reading those signals is part of identifying the thesis *and any indication it provides of the argument's structure*.",
  whyNot: [
    "Sentence length predicts nothing about the argument's shape.",
    "A thesis rarely quotes, and quotation says nothing about what follows.",
    "Neither form maps onto those structures reliably."
  ]
},

{
  id: "qz-ce-claim-evidence-paragraph-01",
  conceptId: "ce-claim-evidence-paragraph",
  source: "Skill 4.A",
  stem: "What three parts does the CED give a body paragraph?",
  options: [
    "A topic sentence, three pieces of evidence, and a link",
    "A claim, evidence supporting it",
    "A quotation, a paraphrase, and an evaluation",
    "A concession, a rebuttal, and a restatement of the thesis"
  ],
  answer: 1,
  why: "The commentary's job is to explain how the paragraph contributes to the reasoning of the argument — which is what makes it a paragraph rather than a display case.",
  whyNot: [
    "Three pieces of evidence is a template, and the rubric never counts them per paragraph.",
    "Paraphrase in place of commentary is the trap this concept warns against.",
    "That is one possible paragraph, not the general shape."
  ]
},
{
  id: "qz-ce-claim-evidence-paragraph-02",
  conceptId: "ce-claim-evidence-paragraph",
  source: "Skill 4.A",
  stem: "Why one claim per paragraph?",
  options: [
    "Because the rubric counts paragraphs against claims",
    "Because two claims halve the evidence and split the commentary",
    "Because readers expect a claim in the topic-sentence position",
    "Because a second claim would repeat the first in different words"
  ],
  answer: 1,
  why: "The Row B decision rules describe two-point responses as ones that do not adequately support more than one claim. Splitting a paragraph costs nothing — you have as many as you want.",
  whyNot: [
    "No row counts paragraphs at all.",
    "Expectation is a convention rather than a reason, and the claim need not come first.",
    "Two claims in a paragraph are usually distinct, which is exactly the problem."
  ]
},
{
  id: "qz-ce-claim-evidence-paragraph-03",
  conceptId: "ce-claim-evidence-paragraph",
  source: "Skill 4.A",
  stem: "What does it mean to embed source material syntactically?",
  options: [
    "To place the quotation immediately after the claim it supports",
    "To shorten the quotation so it fits the paragraph's rhythm",
    "To build it into a sentence you wrote, with your own framing verb",
    "To paraphrase rather than quote wherever possible"
  ],
  answer: 2,
  why: "‘The writer answers her own question with a single adjective' embeds; the same words dropped in as a standalone sentence do not. Commentary is what introduces source material into a line of reasoning in the first place.",
  whyNot: [
    "Proximity does not make a quotation part of your sentence.",
    "Length is a separate matter, and a long quotation can be embedded.",
    "Paraphrase and quotation can both be embedded or dropped."
  ]
},
{
  id: "qz-ce-claim-evidence-paragraph-04",
  conceptId: "ce-claim-evidence-paragraph",
  source: "Skill 4.A",
  stem: "Is claim-evidence-commentary a required order?",
  options: [
    "Yes — the rubric names it as the body-paragraph structure",
    "Yes on Q2, where the claim must precede the quotation",
    "No — evidence-first paragraphs work when the claim is one a reader will resist",
    "No — the order is required only in the first body paragraph"
  ],
  answer: 2,
  why: "It is the safe default under time pressure, not a rule. Arriving at the claim follows the same logic as a writer who leads a reader through the reasoning before naming the thesis.",
  whyNot: [
    "The rubric names the three parts and not their order.",
    "No question constrains the order within a paragraph.",
    "No paragraph is singled out for a required order."
  ]
},

{
  id: "qz-ce-commentary-01",
  conceptId: "ce-commentary",
  source: "Skill 6.A",
  stem: "The Row B evidence descriptor is identical at three points and at four. What does that tell you?",
  options: [
    "That the fourth point is bought entirely with commentary",
    "That evidence is weighted equally with commentary",
    "That the fourth point requires an additional source",
    "That the two rows differ only in the thesis they support"
  ],
  answer: 0,
  why: "Read the commentary column down and the progression is summarise → relate → support a line of reasoning → do it consistently. Once your evidence is specific and covers every claim, more evidence cannot raise your score.",
  whyNot: [
    "Three of the four ladder steps are about commentary quality, so the weighting is anything but equal.",
    "Only Question 1 counts sources, and its count is settled at two points.",
    "The thesis belongs to Row A."
  ]
},
{
  id: "qz-ce-commentary-02",
  conceptId: "ce-commentary",
  source: "Skill 6.A",
  stem: "What are commentary's two jobs?",
  options: [
    "To introduce the quotation and to conclude the paragraph",
    "To restate the claim and to transition to the next paragraph",
    "To evaluate the source and to compare it with another",
    "Local: why this evidence supports this claim. Global"
  ],
  answer: 3,
  why: "The local job makes a paragraph coherent; the global job makes an essay one. A paragraph that does only the first has explained a quotation without advancing an argument.",
  whyNot: [
    "Introducing is embedding, and concluding is not a job the rubric names.",
    "Restatement is the best-disguised version of the failure.",
    "Evaluation and comparison are useful moves and not what commentary is for."
  ]
},
{
  id: "qz-ce-commentary-03",
  conceptId: "ce-commentary",
  source: "Skill 6.A",
  stem: "How do you test whether a commentary sentence is really restating the claim?",
  options: [
    "Check whether it is longer than the evidence it explains",
    "Check whether it mentions something specific from the evidence as well as the claim",
    "Check whether it begins with a transition word",
    "Check whether it appears at the end of the paragraph"
  ],
  answer: 1,
  why: "It must assert a relationship between the two. If it mentions only the claim, it is repetition — and it will sit in the right place, at the right length, looking like analysis.",
  whyNot: [
    "Length is a useful rule of thumb and does not detect restatement.",
    "Transitions decorate a sentence without changing what it asserts.",
    "Position is exactly what makes the failure hard to see."
  ]
},
{
  id: "qz-ce-commentary-04",
  conceptId: "ce-commentary",
  source: "Skill 6.A",
  stem: "Why does the rubric weight commentary above evidence?",
  options: [
    "Because evidence can be copied or recalled",
    "Because commentary is harder to write under time pressure",
    "Because evidence is already credited in Row A",
    "Because readers can verify commentary but not evidence"
  ],
  answer: 0,
  why: "The relationship between evidence and claim exists only in the writer's head until it is written down, so commentary is the only part of a paragraph that could not have been assembled without thought.",
  whyNot: [
    "Difficulty is not what the rubric is measuring.",
    "Row A concerns the thesis alone.",
    "Both are on the page and equally checkable."
  ]
},

{
  id: "qz-ce-evidence-without-commentary-01",
  conceptId: "ce-evidence-without-commentary",
  source: "Q3 Row B",
  stem: "State the covering test for distinguishing paraphrase from commentary.",
  options: [
    "Cover the claim; if the explanation still stands, it was commentary",
    "Cover the quotation; if the explanation still makes complete sense, it was paraphrase",
    "Cover the commentary; if the paragraph still argues, the commentary was redundant",
    "Cover the topic sentence; if the paragraph still coheres, the claim was implicit"
  ],
  answer: 1,
  why: "A paraphrase contains the same information as the quotation, so it survives alone. Commentary becomes incomplete, because it refers to something the reader can no longer see.",
  whyNot: [
    "Covering the claim tests something else, and commentary should refer to the claim.",
    "Removing commentary always weakens a paragraph, so this test cannot discriminate.",
    "Covering the topic sentence tests paragraph structure rather than the commentary."
  ]
},
{
  id: "qz-ce-evidence-without-commentary-02",
  conceptId: "ce-evidence-without-commentary",
  source: "Q3 Row B",
  stem: "Which group of sentence openers signals commentary rather than paraphrase?",
  options: [
    "‘This shows that…', ‘This means…', ‘In other words…'",
    "‘Here the writer is saying…', ‘The quotation tells us…'",
    "‘For example…', ‘To illustrate…', ‘As seen when…'",
    "‘The reason this matters is…', ‘What the word rules out is…'"
  ],
  answer: 3,
  why: "The paraphrase openers point backwards at the quotation; the commentary openers point outwards to the claim. It is a five-second diagnostic on your own draft.",
  whyNot: [
    "These are the classic paraphrase openers.",
    "These point back at the quotation just as directly.",
    "These introduce evidence rather than explain it."
  ]
},
{
  id: "qz-ce-evidence-without-commentary-03",
  conceptId: "ce-evidence-without-commentary",
  source: "Q3 Row B",
  stem: "How does the rubric score summary of evidence?",
  options: [
    "As present but insufficient commentary, worth one point",
    "As absent commentary, worth zero in Row B",
    "As evidence rather than commentary, so it raises the evidence column",
    "As a Row C failure, since it oversimplifies the material"
  ],
  answer: 0,
  why: "The one-point row reads that the response summarises the evidence but does not explain how it supports the argument. The rubric anticipates that you will write something after the quotation, and that it will be a restatement.",
  whyNot: [
    "It is credited, at one point — which is what makes the failure survivable and easy to miss.",
    "A summary of your own evidence adds nothing to the evidence column.",
    "Row C concerns sophistication and is scored separately."
  ]
},
{
  id: "qz-ce-evidence-without-commentary-04",
  conceptId: "ce-evidence-without-commentary",
  source: "Q3 Row B",
  stem: "A paragraph is thin. Why is adding a fourth quotation the wrong fix?",
  options: [
    "Because paragraphs are capped at three pieces of evidence",
    "Because the reader stops counting evidence after three",
    "Because adding a quotation after three paraphrases produces four paraphrases",
    "Because the extra quotation would come from an already-used source"
  ],
  answer: 2,
  why: "Thin analysis is not a shortage of evidence: the three- and four-point rows carry the same evidence descriptor. What is missing is the explaining.",
  whyNot: [
    "No cap exists anywhere in the rubric.",
    "Readers score against the criteria rather than counting.",
    "Source reuse is unrestricted once the minimum is met."
  ]
},

{
  id: "qz-ce-modifiers-01",
  conceptId: "ce-modifiers",
  source: "Skill 3.C",
  stem: "In what sense is a qualified claim **stronger** than an absolute one?",
  options: [
    "It persuades more readers, since fewer will disagree with it",
    "It survives the strongest available objection, having traded reach for defensibility",
    "It is more precise, and precision is credited in Row C",
    "It is easier to evidence, so Row B rises with it"
  ],
  answer: 1,
  why: "‘Social media harms teenagers' has enormous reach and is destroyed by one counter-example. The narrower version says less and holds. Strength in argument means withstanding objection, not covering ground.",
  whyNot: [
    "Agreement is not the measure; an uncontested claim is usually an empty one.",
    "Precision helps, and Row C credits sophistication that is part of the argument rather than precision as such.",
    "Easier evidencing is a consequence rather than the sense in which it is stronger."
  ]
},
{
  id: "qz-ce-modifiers-02",
  conceptId: "ce-modifiers",
  source: "Skill 3.C",
  stem: "Which of these qualifies rather than hedges?",
  options: [
    "‘Testing arguably disadvantages certain students'",
    "‘Testing somewhat disadvantages students to a certain extent'",
    "‘Testing may have some effect on some applicants'",
    "‘Testing disadvantages applicants whose schools offer no advanced coursework'"
  ],
  answer: 3,
  why: "A qualifier tells the reader something specific about where the claim applies. A hedge reduces commitment without stating a boundary, so it costs reach and buys no defensibility.",
  whyNot: [
    "‘Arguably' and ‘certain' name no boundary at all.",
    "This hedges twice and says nothing either time.",
    "This is evacuation rather than qualification: it commits to nothing."
  ]
},
{
  id: "qz-ce-modifiers-03",
  conceptId: "ce-modifiers",
  source: "Skill 3.C",
  stem: "On the reading side, what does a writer's modifier reveal?",
  options: [
    "What the writer expects to be challenged on",
    "How confident the writer feels about the claim",
    "Which source the claim was drawn from",
    "How much of the argument remains to be made"
  ],
  answer: 0,
  why: "A phrase such as ‘in the years immediately after the war' shows the writer anticipated a reader with a later counter-example. Naming that anticipation is analysis; listing the modifier is not.",
  whyNot: [
    "Confidence lives in the writer and defensibility in the sentence; the modifier reports the second.",
    "Modifiers narrow scope and say nothing about provenance.",
    "They constrain the claim rather than signal the argument's progress."
  ]
},
{
  id: "qz-ce-modifiers-04",
  conceptId: "ce-modifiers",
  source: "Skill 3.C",
  stem: "Why do a qualified thesis and a vague thesis feel similar while being opposites?",
  options: [
    "Both use the same modifier families, in different positions",
    "Both are produced by the wish not to be caught out",
    "Both narrow the claim, but only one narrows it enough",
    "Both are penalised in Row A, for different reasons"
  ],
  answer: 1,
  why: "A qualified thesis says *less*, precisely; a vague thesis says *nothing*, imprecisely. They arrive from the same instinct and end up in opposite places.",
  whyNot: [
    "A vague thesis usually has no genuine modifier in it at all.",
    "A vague thesis does not narrow the claim; it evacuates it.",
    "A qualified thesis is fully defensible and earns Row A."
  ]
},

{
  id: "qz-ce-concede-rebut-refute-01",
  conceptId: "ce-concede-rebut-refute",
  source: "Skill 3.C",
  stem: "What separates rebutting from refuting?",
  options: [
    "Rebutting addresses evidence; refuting addresses the claim",
    "Rebutting happens in the body; refuting happens in the conclusion",
    "Rebutting proposes that a position is invalid",
    "Rebutting concerns a source's perspective; refuting concerns its position"
  ],
  answer: 2,
  why: "The difference is the strength of the move. Rebutting offers a contrasting perspective or alternative evidence; refuting shows the competing position cannot stand.",
  whyNot: [
    "Both can address either.",
    "Neither is tied to a position in the essay.",
    "Both may concern either, and perspective and position are a separate distinction."
  ]
},
{
  id: "qz-ce-concede-rebut-refute-02",
  conceptId: "ce-concede-rebut-refute",
  source: "Skill 3.C",
  stem: "Which form of concession is a listed route to the Row C point on Questions 1 and 3?",
  options: [
    "Accepting part of the competing claim as correct",
    "Agreeing the objection would hold under different circumstances",
    "Acknowledging a limitation of your own argument",
    "Conceding the opposing position entirely and arguing a narrower one"
  ],
  answer: 2,
  why: "Those rows credit articulating the implications or limitations of an argument by situating it within a broader context — provided it is part of the argument rather than an aside.",
  whyNot: [
    "Giving up a fact and keeping your position is ordinary concession and is not the listed route.",
    "Giving up a hypothetical gains a boundary and is likewise not what the row names.",
    "Total concession would leave no position to defend."
  ]
},
{
  id: "qz-ce-concede-rebut-refute-03",
  conceptId: "ce-concede-rebut-refute",
  source: "Skill 3.C",
  stem: "The CED notes that not all arguments explicitly address a counterargument. Why does that matter for reading?",
  options: [
    "Because the absence of one is a choice you can analyse",
    "Because an argument without one cannot earn Row C",
    "Because such arguments are usually addressed to hostile audiences",
    "Because the counterargument must then be inferred from the evidence"
  ],
  answer: 0,
  why: "A writer addressing a sympathetic audience may judge that raising an objection would introduce a doubt the audience did not have. That judgement is readable from the page.",
  whyNot: [
    "Row C has several routes, and counterargument is only one of them.",
    "The opposite is more usual: a hostile audience is the case where objections must be met.",
    "Nothing needs to be inferred — the omission is the datum."
  ]
},
{
  id: "qz-ce-concede-rebut-refute-04",
  conceptId: "ce-concede-rebut-refute",
  source: "Skill 3.C",
  stem: "Why does conceding make a writer **more** credible rather than less?",
  options: [
    "Because a concession pre-empts the reader's strongest objection",
    "Because agreeing about something true shows the argument was reached, not assumed",
    "Because concessions shorten the argument and leave room for evidence",
    "Because the rubric credits concession directly in Row B"
  ],
  answer: 1,
  why: "Writers enhance their credibility when they refute, rebut or concede opposing arguments and contradictory evidence. Contradicting evidence is not an obstacle to be hidden: it is one of the three things evidence can do.",
  whyNot: [
    "Pre-emption is a tactical benefit and not the reason credibility rises.",
    "Concessions usually lengthen an argument.",
    "Row B concerns evidence and commentary; concession figures in Row C."
  ]
},

{
  id: "qz-ce-qualify-your-claim-01",
  conceptId: "ce-qualify-your-claim",
  source: "Skill 4.C",
  stem: "What does ‘qualify the scope, not the verb' mean in practice?",
  options: [
    "Keep the verb absolute and narrow the subject",
    "Replace the verb with a weaker one and keep the subject broad",
    "Add a modal such as ‘may' to the main clause",
    "Move the qualification into a subordinate clause at the end"
  ],
  answer: 0,
  why: "‘Testing may somewhat disadvantage some students' hedges the verb and says nothing. ‘Testing disadvantages applicants whose schools offer no advanced coursework' is smaller and fully committed — the combination you want.",
  whyNot: [
    "Weakening the verb is exactly the hedge being warned against.",
    "A modal reduces commitment without naming a boundary.",
    "Position in the sentence does not decide whether a qualification is real."
  ]
},
{
  id: "qz-ce-qualify-your-claim-02",
  conceptId: "ce-qualify-your-claim",
  source: "Skill 4.C",
  stem: "Why put the concession and the claim in the same sentence?",
  options: [
    "Because a single sentence is easier to write under time pressure",
    "Because separate paragraphs read as a survey of both sides",
    "Because the rubric requires the thesis to be one sentence",
    "Because a concession in its own paragraph cannot be evidenced"
  ],
  answer: 1,
  why: "A survey with no position attached is the equivocation failure. ‘Although X, Y' reads as a position that has already absorbed the objection — the pattern of the rubric's own earning example.",
  whyNot: [
    "Speed is incidental, and the ‘although' construction is not obviously quicker.",
    "The notes explicitly permit a thesis of more than one sentence.",
    "A concession can be evidenced anywhere; the objection is to how the survey reads."
  ]
},
{
  id: "qz-ce-qualify-your-claim-03",
  conceptId: "ce-qualify-your-claim",
  source: "Skill 4.C",
  stem: "How do you check that a qualification actually qualified something?",
  options: [
    "Count the modifiers you added to the thesis sentence",
    "Check that the opposing view is named somewhere in the essay",
    "Count what you now have to prove against what you had to prove before",
    "Check that the qualification appears before the first body paragraph"
  ],
  answer: 2,
  why: "If the burden of proof has not shrunk, you have added words rather than a qualification. That is also why qualification is a decision made before you write rather than a garnish added after.",
  whyNot: [
    "Modifier count measures words, which is what the test is designed to see past.",
    "Naming the opposing view is a separate move and can leave the claim untouched.",
    "Placement is unrestricted."
  ]
},
{
  id: "qz-ce-qualify-your-claim-04",
  conceptId: "ce-qualify-your-claim",
  source: "Skill 4.C",
  stem: "Why does a closing ‘of course, there are other views' paragraph fail Row C?",
  options: [
    "Because Row C requires the counterargument to appear in the introduction",
    "Because it arrives after the argument is over and changed nothing before it",
    "Because Row C credits only qualification by modifier, not by counterargument",
    "Because conclusions are excluded from Row C scoring"
  ],
  answer: 1,
  why: "The row requires the sophistication to be part of the student's argument rather than merely a phrase or reference. If the qualification were real, it would have changed which paragraphs you wrote.",
  whyNot: [
    "No row constrains where a counterargument appears.",
    "Skill 4.C names modifiers, counterarguments and alternative perspectives alike.",
    "Conclusions are read and scored with everything else."
  ]
},

/* ---- Reasoning and organisation ------------------------------------------- */

{
  id: "qz-ro-line-of-reasoning-01",
  conceptId: "ro-line-of-reasoning",
  source: "Skill 5.A",
  stem: "A student describes a passage as: childhood, then the factory, then the demand for a law. What have they described?",
  options: [
    "A line of reasoning, stated in the order the writer chose",
    "Chronology — the order of events, or of paragraphs",
    "A method of development, namely narration",
    "A convergence of independent claims on one thesis"
  ],
  answer: 1,
  why: "It answers ‘what comes next' rather than ‘what does each part make available to the next'. The line of reasoning would be that being the child in that factory gives her standing to describe conditions no legislator has seen, which makes the demand read as testimony rather than opinion.",
  whyNot: [
    "A line of reasoning states the relationships between consecutive claims, which this does not.",
    "Narration is one method the passage may use, and naming it would explain no more than the sequence does.",
    "Convergence would require the parts to be independent supports, which is a different structure again."
  ]
},
{
  id: "qz-ro-line-of-reasoning-02",
  conceptId: "ro-line-of-reasoning",
  source: "Skill 5.A",
  stem: "What does commentary support, that evidence does not?",
  options: [
    "The claim, which evidence only illustrates",
    "The thesis, which evidence supports only indirectly",
    "The link between consecutive claims",
    "The relevance of the source the evidence came from"
  ],
  answer: 2,
  why: "Evidence supports a claim; commentary supports the *link*. An argument with excellent evidence under every claim and nothing joining them is exactly what the decision rules describe as one where a line of reasoning is not clearly established.",
  whyNot: [
    "Evidence supports claims directly — that is its job.",
    "Evidence supports the thesis through the claims, and commentary is what makes that route visible.",
    "Source relevance matters and is not the thing commentary uniquely supplies."
  ]
},
{
  id: "qz-ro-line-of-reasoning-03",
  conceptId: "ro-line-of-reasoning",
  source: "Skill 5.A",
  stem: "What does the deletion test reveal about a body paragraph?",
  options: [
    "Whether it belongs to the topic of the essay",
    "Whether it was in the chain or merely on the list",
    "Whether its evidence is specific enough for Row B",
    "Whether the writer had time to finish it"
  ],
  answer: 1,
  why: "Remove the paragraph. If nothing later stops making sense, nothing later depended on it — which tells you the order was carrying no reasoning at that point.",
  whyNot: [
    "Topic relevance is a unity question, and a paragraph can be relevant and still deletable.",
    "Specificity is judged inside the paragraph rather than by removing it.",
    "Length and completeness are separate matters."
  ]
},
{
  id: "qz-ro-line-of-reasoning-04",
  conceptId: "ro-line-of-reasoning",
  source: "Skill 5.A",
  stem: "You are reading a passage and cannot write ‘this paragraph establishes X **so that** the next can claim Y'. What follows?",
  options: [
    "You have found either a flaw in the argument or a gap in your reading",
    "The passage is organised categorically and has no line of reasoning",
    "The paragraph is the thesis paragraph, which owes nothing to what follows",
    "The passage uses a delayed thesis, so the links appear only at the end"
  ],
  answer: 0,
  why: "It is worth deciding which. Skill 5.A has two halves — describe the line of reasoning, and explain whether it supports the thesis — and a missing ‘so that' is where the second half starts.",
  whyNot: [
    "Categorical organisation carries its reasoning elsewhere, usually in commentary, rather than having none.",
    "A thesis paragraph still makes something available to what follows.",
    "A delayed thesis still links its steps as it goes; that is what makes the delay work."
  ]
},

{
  id: "qz-ro-reasoning-not-a-list-01",
  conceptId: "ro-reasoning-not-a-list",
  source: "Skill 6.A",
  stem: "What single change moves Row B commentary from a typical two to a typical three?",
  options: [
    "Adding a further supporting claim",
    "Replacing general evidence with specific evidence",
    "Explaining the connections or progression between your claims",
    "Quoting from an additional source"
  ],
  answer: 2,
  why: "The two-point decision rules describe a response that does not explain those connections, so no line of reasoning is established. The three-point rules describe an argument organised as a line of reasoning composed of multiple supporting claims. The upgrade is entirely relational.",
  whyNot: [
    "The three-point description does not ask for more claims.",
    "Specificity carries the step from one point to two on Q2 and Q3.",
    "Source counts matter only on Question 1, and only up to two points."
  ]
},
{
  id: "qz-ro-reasoning-not-a-list-02",
  conceptId: "ro-reasoning-not-a-list",
  source: "Skill 6.A",
  stem: "Which arrangement of supporting claims **cannot** score well?",
  options: [
    "A chain, where claim two is available only because claim one was established",
    "A convergence, where independent claims each make the thesis more likely",
    "A pile, where the claims are individually fine and jointly unaddressed",
    "A mixture of chain and convergence within one essay"
  ],
  answer: 2,
  why: "Both honest shapes can score. What fails is claims whose relationship is never addressed — which is the two-point profile of an essay that is full rather than thin.",
  whyNot: [
    "A chain is the clearest form a line of reasoning can take.",
    "A convergence scores provided the writer explains why the claims converge rather than merely coincide.",
    "Mixing the two is ordinary and unproblematic."
  ]
},
{
  id: "qz-ro-reasoning-not-a-list-03",
  conceptId: "ro-reasoning-not-a-list",
  source: "Skill 6.A",
  stem: "You swap body paragraphs two and three and nothing breaks. What does that tell you?",
  options: [
    "The essay is disunified and one paragraph should be cut",
    "The order was carrying no reasoning",
    "The paragraphs are interchangeable, which is a strength under time pressure",
    "The thesis was stated too early to constrain the body"
  ],
  answer: 1,
  why: "The fix is one sentence at the top of each paragraph naming what the previous paragraph has now made available. That sentence is unfakeable — you cannot write it unless the reasoning is really there.",
  whyNot: [
    "Both paragraphs may serve the thesis perfectly well; the test is about order, not relevance.",
    "Interchangeability is exactly what the decision rules describe as a line of reasoning not established.",
    "Thesis placement does not determine whether the body paragraphs depend on one another."
  ]
},
{
  id: "qz-ro-reasoning-not-a-list-04",
  conceptId: "ro-reasoning-not-a-list",
  source: "Skill 6.A",
  stem: "Why is ‘Secondly, social media harms attention spans' not a stated connection?",
  options: [
    "Because ‘secondly' is an informal transition",
    "Because the claim is too broad to be defended",
    "Because it announces a new claim without saying what the previous one did for it",
    "Because a topic sentence must name the evidence that follows"
  ],
  answer: 2,
  why: "Compare a version that names what it inherits: if the problem is not the volume of information but the speed at which it arrives, then attention is the faculty most directly under pressure. Same claim, but the link is now on the page.",
  whyNot: [
    "Register is not the issue, and a numbered list can be perfectly formal.",
    "Breadth is a separate problem and would remain after the connection was stated.",
    "No rule requires a topic sentence to preview evidence."
  ]
},

{
  id: "qz-ro-two-shapes-01",
  conceptId: "ro-two-shapes",
  source: "Skill 5.A",
  stem: "Why would a writer delay the thesis to the end?",
  options: [
    "Because the audience would reject it on sight",
    "Because a delayed thesis is harder for a reader to test",
    "Because the evidence was gathered before the position was formed",
    "Because a conclusion is the most emphatic position in a text"
  ],
  answer: 0,
  why: "Each step is stated in terms the resistant reader can accept alone, so by the time the conclusion arrives, refusing it means withdrawing something already granted.",
  whyNot: [
    "Making a claim hard to test is not a persuasive advantage and would not survive a careful reader.",
    "The order of composition has no bearing on the order of presentation.",
    "Emphasis is real and is not why the delay persuades."
  ]
},
{
  id: "qz-ro-two-shapes-02",
  conceptId: "ro-two-shapes",
  source: "Skill 5.A",
  stem: "A passage seems to have no thesis. What is the most likely explanation?",
  options: [
    "It is expository rather than argumentative",
    "The thesis is the position the whole passage commits to, without any one sentence announcing it",
    "The thesis was cut when the passage was excerpted for the exam",
    "The passage is a counterargument to a text not supplied"
  ],
  answer: 1,
  why: "A text can have a thesis without containing a thesis statement, and identifying it may need a full reading. Check whether the last third says something the first third did not.",
  whyNot: [
    "Exam passages are argumentative, and an unstated thesis is the normal case rather than an exception.",
    "Excerpting does not remove a position the passage commits to throughout.",
    "A counterargument still commits to a position of its own."
  ]
},
{
  id: "qz-ro-two-shapes-03",
  conceptId: "ro-two-shapes",
  source: "Skill 5.A",
  stem: "The rubric permits a thesis anywhere. What should you do in your own essay, and why?",
  options: [
    "Delay it, since that is the more sophisticated structure",
    "Place it in the conclusion, so the body can discover it",
    "Split it across the introduction and conclusion for coverage",
    "State it early, because a fast reader is least likely to miss it"
  ],
  answer: 3,
  why: "The rule is about what earns the point; the advice is about a reader working quickly through many essays. Save the delayed thesis for reading, where you have to recognise it.",
  whyNot: [
    "Sophistication is not what Row A measures, and delay risks the point being missed.",
    "It would earn the point and is the riskiest available placement.",
    "The notes require the sentences of a thesis to be in close proximity."
  ]
},
{
  id: "qz-ro-two-shapes-04",
  conceptId: "ro-two-shapes",
  source: "Skill 5.A",
  stem: "What goes wrong when a delayed-thesis passage is read as though paragraph one held the thesis?",
  options: [
    "Every later observation is measured against the wrong target",
    "The passage appears more coherent than it is",
    "The reader over-estimates the strength of the evidence",
    "The counterargument is mistaken for a concession"
  ],
  answer: 0,
  why: "Students then analyse the groundwork as if it were the claim. Before deciding what a passage argues, check whether its last third says something the first third did not.",
  whyNot: [
    "Coherence is unaffected by which sentence you take as the claim.",
    "Evidence strength is judged separately and is not systematically inflated by this error.",
    "That is a different confusion, about the treatment of opposing views."
  ]
},

{
  id: "qz-ro-arrival-test-01",
  conceptId: "ro-arrival-test",
  source: "Skill 5.A",
  stem: "What does it mean to call a line of reasoning **specious**?",
  options: [
    "Its steps are individually acceptable and jointly insufficient",
    "Its evidence has been fabricated or misattributed",
    "Its conclusion is true but reached by luck",
    "It contains an obvious error that a reader will catch at once"
  ],
  answer: 0,
  why: "Specious means an argument that looks sound. That is why the gap-hunting has a procedure — write the thesis, write the strongest claim the evidence actually establishes, and compare.",
  whyNot: [
    "Fabrication is a different fault, and a specious argument may use impeccable evidence.",
    "Truth of the conclusion is not what the word picks out.",
    "An obvious error is the opposite of specious."
  ]
},
{
  id: "qz-ro-arrival-test-02",
  conceptId: "ro-arrival-test",
  source: "Skill 5.A",
  stem: "Your body paragraphs prove a smaller claim than your thesis. What is the cheaper repair?",
  options: [
    "Add a fourth body paragraph covering the remaining ground",
    "Narrow the thesis to what the paragraphs establish",
    "Add a qualification to the conclusion acknowledging the gap",
    "Strengthen the commentary in the existing paragraphs"
  ],
  answer: 1,
  why: "Row A asks for a defensible position, not an ambitious one, and rewriting one sentence costs less than manufacturing evidence you do not have.",
  whyNot: [
    "A fourth paragraph is the most expensive option and may arrive without commentary.",
    "A qualification in the conclusion arrives after the argument is over and repairs nothing.",
    "Better commentary is always worth having and does not close a gap in scope."
  ]
},
{
  id: "qz-ro-arrival-test-03",
  conceptId: "ro-arrival-test",
  source: "Skill 5.A",
  stem: "Which half of Skill 5.A do students routinely skip?",
  options: [
    "Describing the line of reasoning",
    "Naming the method of development used",
    "Explaining whether the reasoning supports the overarching thesis",
    "Identifying where the thesis is stated"
  ],
  answer: 2,
  why: "The skill has two halves and the second is the one that requires a route rather than a verdict. ‘The author supports her thesis well with strong evidence' is neither an explanation nor checkable.",
  whyNot: [
    "Describing the reasoning is the half students do.",
    "Methods of development belong to Skill 5.C.",
    "Locating the thesis is part of the first half."
  ]
},
{
  id: "qz-ro-arrival-test-04",
  conceptId: "ro-arrival-test",
  source: "Skill 5.A",
  stem: "You notice a gap in a passage's reasoning on the Rhetorical Analysis. How should you use it?",
  options: [
    "State that the argument fails and explain why",
    "Ignore it, since Question 2 does not assess the argument's validity",
    "Say what the gap lets the writer do",
    "Compare it with a stronger version of the same argument"
  ],
  answer: 2,
  why: "You are analysing choices rather than marking the writer's homework. A gap noticed is only useful when it explains something about how the passage works on its audience.",
  whyNot: [
    "A verdict on the argument answers a question the prompt did not ask.",
    "The gap is usable — it is a fact about the passage — provided it is put to analytical work.",
    "An improved version is a rewrite rather than an analysis."
  ]
},

{
  id: "qz-ro-unity-vs-coherence-01",
  conceptId: "ro-unity-vs-coherence",
  source: "Skill 5.B",
  stem: "Describe an essay that is **coherent but disunified**.",
  options: [
    "Three relevant paragraphs sitting next to each other in silence",
    "One that flows smoothly and ends somewhere it had no business going",
    "One whose paragraphs could be reordered without anything breaking",
    "One whose thesis arrives only in the final paragraph"
  ],
  answer: 1,
  why: "The connectives were steering instead of the thesis. Coherence is local and checkable at the joints; unity is a property of the whole, and answers the question of whether anything here is doing no work.",
  whyNot: [
    "That is unified but incoherent — every part belongs, and none of the joints are stated.",
    "Reorderability is a symptom of reasoning not carried by the order, which is a third thing again.",
    "A late thesis is a legitimate structure and says nothing about either property."
  ]
},
{
  id: "qz-ro-unity-vs-coherence-02",
  conceptId: "ro-unity-vs-coherence",
  source: "Skill 5.B",
  stem: "You diagnose an essay as disunified. Why is adding transitions the wrong fix?",
  options: [
    "Because transitions belong at the start of paragraphs, not between them",
    "Because the rubric does not credit transitional elements",
    "Because disunity is fixed by deleting, or by rewriting the thesis so the stray material belongs",
    "Because transitions cannot be added without rewriting the evidence"
  ],
  answer: 2,
  why: "Adding transitions to a disunified essay produces a text that announces logical relationships that are not there, which reads as confused rather than merely unconnected.",
  whyNot: [
    "Transitions can be words, clauses, sentences or whole paragraphs, and their position is not the issue.",
    "Transitional elements are a reporting category in two rubric rows.",
    "Transitions can be added freely; the problem is what they would claim."
  ]
},
{
  id: "qz-ro-unity-vs-coherence-03",
  conceptId: "ro-unity-vs-coherence",
  source: "Skill 5.B",
  stem: "Why is ‘stay on topic' a poor test of unity?",
  options: [
    "Because topic is not thesis, and paragraphs can serve the subject without serving the position",
    "Because unity is a property of sentences rather than paragraphs",
    "Because the topic is set by the prompt and cannot be departed from",
    "Because staying on topic is a Row C rather than a Row B concern"
  ],
  answer: 0,
  why: "An essay on libraries in which every paragraph is genuinely about libraries can still be badly disunified. Ask not whether a paragraph is about your topic but which claim of yours it establishes.",
  whyNot: [
    "Unity is a property of the whole text, which is why it survives revision so easily.",
    "Prompts set a subject, and the position within it is yours.",
    "Neither row names topic adherence."
  ]
},
{
  id: "qz-ro-unity-vs-coherence-04",
  conceptId: "ro-unity-vs-coherence",
  source: "Skill 5.B",
  stem: "At what scale is coherence tested?",
  options: [
    "Globally, by reading the whole text and judging whether it flowed",
    "At the joints — clause to clause, sentence to sentence, paragraph to paragraph",
    "At the level of the thesis, which must govern every paragraph",
    "At the level of the evidence, which must come from consistent sources"
  ],
  answer: 1,
  why: "Coherence is defined at levels rather than as a global feeling, which is what makes it local and checkable. Unity is the property judged across the whole.",
  whyNot: [
    "Reading for flow is exactly the impressionistic test the levels are meant to replace.",
    "Thesis governance is unity.",
    "Source consistency is an evidence matter."
  ]
},

{
  id: "qz-ro-coherence-levels-01",
  conceptId: "ro-coherence-levels",
  source: "Skill 5.B",
  stem: "Which four devices does the CED name as indicating or developing a relationship between elements of a text?",
  options: [
    "Repetition, synonyms, pronoun references and parallel structure",
    "Transitions, topic sentences, summaries and signposts",
    "Metaphor, analogy, anecdote and illustration",
    "Definition, narration, comparison and description"
  ],
  answer: 0,
  why: "Each can either point out a relationship that was already there or build one. The second use is the analysable one, because it does argumentative work without making a claim.",
  whyNot: [
    "These are organisational furniture rather than the named coherence devices.",
    "Those are comparisons, which relate a text to what an audience already knows.",
    "Those are methods of development."
  ]
},
{
  id: "qz-ro-coherence-levels-02",
  conceptId: "ro-coherence-levels",
  source: "Skill 5.B",
  stem: "What argumentative work does parallel structure do without making a claim?",
  options: [
    "It makes a passage easier to remember and quote",
    "It signals that the writer has planned the paragraph in advance",
    "Grammatical equality asserts conceptual equality",
    "It compresses several claims into a single sentence"
  ],
  answer: 2,
  why: "Three consequences in three identically shaped clauses say that these are the same kind of thing and equally weighty — which the writer never has to defend. Breaking the pattern then becomes emphasis.",
  whyNot: [
    "Memorability is a real effect and not an argumentative one.",
    "Evidence of planning is not a claim about the subject.",
    "Compression is a stylistic benefit and asserts nothing about the items."
  ]
},
{
  id: "qz-ro-coherence-levels-03",
  conceptId: "ro-coherence-levels",
  source: "Skill 5.B",
  stem: "Why is calling a text coherent because it uses transition words unsafe?",
  options: [
    "Because transitions can be added to text that does not connect",
    "Because transition words are informal and rare in published prose",
    "Because coherence is a property of paragraphs rather than sentences",
    "Because transitions are assessed in Row C rather than Row B"
  ],
  answer: 0,
  why: "The other three devices cannot be faked so easily: a repeated key term, a pronoun that points somewhere real, or a parallel structure all require the ideas to be genuinely related before they work.",
  whyNot: [
    "They are ordinary in published prose at every level of formality.",
    "Coherence is defined at three levels, including sentence to sentence.",
    "Transitional elements are a reporting category in both rows."
  ]
},
{
  id: "qz-ro-coherence-levels-04",
  conceptId: "ro-coherence-levels",
  source: "Skill 5.B",
  stem: "On the multiple-choice writing sets, what usually distinguishes the right answer to a coherence question?",
  options: [
    "It is the version that sounds most sophisticated",
    "It is the version that names the relationship between the two parts",
    "It is the shortest version offered",
    "It is the version that repeats a key term from the previous paragraph"
  ],
  answer: 1,
  why: "Work out the relationship first, in your own words, before looking at the options. Choosing by ear is how ‘nevertheless' gets picked for an addition.",
  whyNot: [
    "Sophistication is what the distractors are built to sound like.",
    "Length is incidental to whether the relationship is named.",
    "Repetition is one coherence device and does not by itself state the relationship."
  ]
},

{
  id: "qz-ro-organisation-reflects-reasoning-01",
  conceptId: "ro-organisation-reflects-reasoning",
  source: "Skill 5.B",
  stem: "What does the placement test ask of a paragraph?",
  options: [
    "Whether it could be moved without a word changing",
    "Whether it belongs to the same category as the paragraphs beside it",
    "Whether its claim is stated in its first sentence",
    "What the reader now knows that they did not before it"
  ],
  answer: 3,
  why: "Same content in a different position is a different rhetorical act. A concession before the main argument disarms an objection; the same concession at the end reads as an afterthought.",
  whyNot: [
    "That is the reordering test, which is a different diagnostic.",
    "Category membership is a feature of categorical organisation rather than a test of placement.",
    "Where the claim sits inside a paragraph is a separate question."
  ]
},
{
  id: "qz-ro-organisation-reflects-reasoning-02",
  conceptId: "ro-organisation-reflects-reasoning",
  source: "Skill 5.B",
  stem: "Paragraphs three and four could swap without a word changing. What should you say about it?",
  options: [
    "That the text is organised categorically and carries its reasoning elsewhere",
    "That the writer has made an error of organisation",
    "That the text has no line of reasoning at all",
    "That the paragraphs are redundant and one should be cut"
  ],
  answer: 0,
  why: "Categorical organisation is a real choice with real effects. It just means the reasoning is carried in the commentary rather than in the order, and saying so beats pretending the order was doing work it was not.",
  whyNot: [
    "It is not automatically a fault, and calling it one misreads the choice.",
    "Reasoning may be fully present and located elsewhere.",
    "Two paragraphs on different categories are not redundant."
  ]
},
{
  id: "qz-ro-organisation-reflects-reasoning-03",
  conceptId: "ro-organisation-reflects-reasoning",
  source: "Skill 5.B",
  stem: "‘The author organises the essay chronologically.' What is missing?",
  options: [
    "A quotation showing the chronology",
    "The name of the method of development",
    "The effect — what the structure lets the writer do to the reader",
    "The paragraph numbers the claim refers to"
  ],
  answer: 2,
  why: "Naming a structure is not explaining it. Complete the sentence with what the structure accomplishes: opening with the objection makes the rest read as a response to the audience's own doubt rather than an argument aimed at them.",
  whyNot: [
    "Evidence would support the observation and still leave it unexplained.",
    "Chronological order is already named; adding a second label adds nothing.",
    "Locating it more precisely does not make it analysis."
  ]
},
{
  id: "qz-ro-organisation-reflects-reasoning-04",
  conceptId: "ro-organisation-reflects-reasoning",
  source: "Skill 5.B",
  stem: "How should introductions and conclusions be treated in an analysis of organisation?",
  options: [
    "As a frame around the argument rather than part of it",
    "As part of the organisation, each doing a different final or opening move",
    "As the only places where the thesis may appear",
    "As stylistic features rather than structural ones"
  ],
  answer: 1,
  why: "A conclusion brings the argument to a unified end, and its options — situating the argument in a wider context, calling for action, proposing a solution, looping back — are different final moves in a line of reasoning, not different ways of stopping.",
  whyNot: [
    "Treating them as a frame is what makes analyses of them so often empty.",
    "The thesis may appear anywhere in the response.",
    "They carry structural work, which is why the placement test applies to them too."
  ]
},

{
  id: "qz-ro-methods-of-development-01",
  conceptId: "ro-methods-of-development",
  source: "Skill 5.C",
  stem: "Skill 5.C ends ‘to accomplish a purpose'. Why does that phrase carry the marks?",
  options: [
    "Because recognising the method is the cheap half",
    "Because purpose is a reporting category on all three essays",
    "Because methods of development are not named in the CED",
    "Because the purpose must be quoted from the passage"
  ],
  answer: 0,
  why: "Writing that a passage uses comparison and contrast identifies a shape and explains nothing. The graded half is what this shape does here that another shape would not.",
  whyNot: [
    "Purpose appears in several rows, and that is not what makes the phrase load-bearing.",
    "Five methods are named explicitly.",
    "Purpose is inferred from the situation rather than quoted."
  ]
},
{
  id: "qz-ro-methods-of-development-02",
  conceptId: "ro-methods-of-development",
  source: "Skill 5.C",
  stem: "What is the scope of a method of development?",
  options: [
    "It is a way of arranging evidence within a paragraph",
    "It is a way of developing reasoning, not of arranging evidence",
    "It is a genre category that fixes the essay's shape",
    "It is a style choice governing diction and syntax"
  ],
  answer: 1,
  why: "Choosing to quote a statistic is an evidence decision. Choosing to present it as the effect of a cause you have just established is a method-of-development decision. The same sentence can be involved in both.",
  whyNot: [
    "Arrangement of evidence is the decision that sits underneath a method rather than being one.",
    "Treating methods as essay formats is the standard error, and it inverts claim and shape.",
    "Diction and syntax belong to the style skills."
  ]
},
{
  id: "qz-ro-methods-of-development-03",
  conceptId: "ro-methods-of-development",
  source: "Skill 5.C",
  stem: "Why does the CED's framing of methods as long-standing conventions matter for analysis?",
  options: [
    "Because a convention cannot be analysed as a choice",
    "Because conventions are the property of the genre rather than the writer",
    "Because the audience already knows them, so expectation is part of the effect",
    "Because older methods are more persuasive than recently invented ones"
  ],
  answer: 2,
  why: "When a writer opens with a narrative, the reader knows to expect a point drawn from it — and that expectation is something the writer is using.",
  whyNot: [
    "A convention is a choice precisely because alternatives were available.",
    "Genre shapes what is expected without removing the writer's decision.",
    "Age is not a measure of persuasive force."
  ]
},
{
  id: "qz-ro-methods-of-development-04",
  conceptId: "ro-methods-of-development",
  source: "Skill 5.C",
  stem: "What is the visible symptom of choosing a method before knowing the claim?",
  options: [
    "A paragraph whose second half is thinner than its first",
    "A thesis that arrives in the conclusion",
    "An essay with more evidence than commentary",
    "A body paragraph with two claims in it"
  ],
  answer: 0,
  why: "An essay that picks its shape first will bend its argument to fit the shape, and the reflexive compare-and-contrast paragraph is where the bend shows: the second side is developed only because the shape demanded it.",
  whyNot: [
    "A late thesis is a legitimate structure chosen for a reason.",
    "An evidence-heavy essay is a commentary problem rather than a method problem.",
    "Two claims in a paragraph is a paragraph-craft failure."
  ]
},

{
  id: "qz-ro-method-catalogue-01",
  conceptId: "ro-method-catalogue",
  source: "Skill 5.C",
  stem: "What constraint does the CED place on comparison-contrast?",
  options: [
    "The two things compared must be of similar importance",
    "The comparison must be sustained for a full paragraph",
    "Like categories of comparison must be used",
    "The similarities must be treated before the differences"
  ],
  answer: 2,
  why: "Comparing the cost of one policy with the popularity of another is two facts in a row rather than a comparison. In a revision set, the option that restores category parity is very often the right answer.",
  whyNot: [
    "Comparing unequal things is often the point of a comparison.",
    "Length is not specified anywhere.",
    "Either order is available."
  ]
},
{
  id: "qz-ro-method-catalogue-02",
  conceptId: "ro-method-catalogue",
  source: "Skill 5.C",
  stem: "Narration has two parts in the CED's description. Which do student essays drop?",
  options: [
    "The details of the experience",
    "The reflection on its significance",
    "The chronological ordering of events",
    "The identification of the narrator"
  ],
  answer: 1,
  why: "A paragraph that narrates and then stops has provided evidence with no commentary — which lands in the rubric exactly where you would expect: evidence present, explanation absent.",
  whyNot: [
    "The details are the part students supply generously.",
    "Ordering is rarely the difficulty.",
    "Who is speaking is usually clear in a personal anecdote."
  ]
},
{
  id: "qz-ro-method-catalogue-03",
  conceptId: "ro-method-catalogue",
  source: "Skill 5.C",
  stem: "Why is definition described as quietly the most powerful method in an argument?",
  options: [
    "Because a defined term cannot be disputed later",
    "Because definitions are shorter than the alternatives",
    "Because the CED lists it first among the five",
    "Because whoever defines the contested term has often decided the question"
  ],
  answer: 3,
  why: "A writer who spends a paragraph establishing what *fairness* will mean in this piece has done something more consequential than one who spends it on statistics — and spotting that in a passage is worth more than spotting a device.",
  whyNot: [
    "A definition can be contested, and often should be.",
    "Brevity is a practical advantage under time pressure rather than the source of the power.",
    "Order in a list carries no weight."
  ]
},
{
  id: "qz-ro-method-catalogue-04",
  conceptId: "ro-method-catalogue",
  source: "Skill 5.C",
  stem: "Which method most needs qualification, and why?",
  options: [
    "Cause-effect, because an absolute causal claim is easy to assert and easy to refute",
    "Description, because sensory detail invites disagreement",
    "Narration, because personal experience cannot be generalised",
    "Comparison, because two things are never wholly alike"
  ],
  answer: 0,
  why: "A hedged causal claim — the most plausible single cause, a contributing factor — is stronger, not weaker, because it is harder to refute. Effective arguments generally avoid absolute terms.",
  whyNot: [
    "Description rarely makes claims that need limiting.",
    "Generalising from experience is a real risk and is handled by commentary rather than by qualification of the method.",
    "Partial likeness is what a comparison assumes rather than a claim needing hedging."
  ]
},

{
  id: "qz-ro-method-for-purpose-01",
  conceptId: "ro-method-for-purpose",
  source: "Skill 6.C",
  stem: "What is the order of operations for choosing a method in your own essay?",
  options: [
    "Method first, so the paragraphs have a shape to fill",
    "Claim first, then the method that answers the likeliest doubt",
    "Evidence first, then whichever method the evidence suggests",
    "Thesis first, then the same method for every paragraph"
  ],
  answer: 1,
  why: "Ask what would make this particular claim hard to doubt. ‘Why should we think A produced B' calls for cause-effect with the mechanism stated; ‘are we talking about the same thing' calls for definition, before anything else.",
  whyNot: [
    "Picking the shape first is what makes an argument bend to fit it.",
    "Evidence gathered before a claim tends to produce a survey.",
    "Different claims invite different methods within one essay."
  ]
},
{
  id: "qz-ro-method-for-purpose-02",
  conceptId: "ro-method-for-purpose",
  source: "Skill 6.C",
  stem: "Under time pressure, which method is cheapest and which is most expensive?",
  options: [
    "Narration is cheapest; description is most expensive",
    "Description is cheapest; cause-effect is most expensive",
    "Definition is cheapest; comparison is most expensive",
    "Cause-effect is cheapest; narration is most expensive"
  ],
  answer: 2,
  why: "Two sentences fixing a contested term can remove an objection you would otherwise answer at length. A comparison obliges you to develop two things on a consistent category, and one that runs out of time reads as avoidance.",
  whyNot: [
    "Narration is cheap to start and expensive to finish, because the reflection is the costly half.",
    "Description is cheap and cause-effect is manageable when the mechanism is stated once.",
    "Neither pairing matches the reason: cost here is about what a method obliges you to complete."
  ]
},
{
  id: "qz-ro-method-for-purpose-03",
  conceptId: "ro-method-for-purpose",
  source: "Skill 6.C",
  stem: "On the synthesis essay, when do the six sources amount to development rather than a list?",
  options: [
    "When each source is quoted at least once",
    "When the sources are arranged so that some establish a mechanism and another shows its effect",
    "When the sources are ordered as the exam presents them",
    "When every source is introduced with its author's name"
  ],
  answer: 1,
  why: "Six sources arranged as a list of what each says is not development, whatever methods are nominally present. Counting sources is a floor for eligibility, not a strategy.",
  whyNot: [
    "Quoting all six is not required and does not create a structure.",
    "The exam's order carries no argument of yours.",
    "Attribution is good practice and does not organise the reasoning."
  ]
},
{
  id: "qz-ro-method-for-purpose-04",
  conceptId: "ro-method-for-purpose",
  source: "Skill 6.C",
  stem: "You have set up a comparison and find yourself treating the two sides on different criteria. What should you do?",
  options: [
    "Defend the mismatch by explaining why the criteria differ",
    "Cut the weaker side and keep the comparison one-sided",
    "Add a third case so the pattern is clearer",
    "Change the method — rewrite it as a definition or a causal account"
  ],
  answer: 3,
  why: "That is a signal the comparison is not the shape this claim wants, and rewriting it will cost less than defending the mismatch — which is a visible logical fault rather than a stylistic one.",
  whyNot: [
    "The mismatch is what a reader will notice, and explaining it draws attention to it.",
    "A one-sided comparison is the avoidance that makes an unfinished comparison damaging.",
    "A third case multiplies the same problem."
  ]
},

{
  id: "qz-ro-commentary-01",
  conceptId: "ro-commentary",
  source: "Skill 6.A",
  stem: "In the Row B commentary descriptors, what does the word ‘consistently' measure?",
  options: [
    "Coverage — that every claim gets explained",
    "Quality — that the explanations are uniformly strong",
    "Length — that commentary matches the evidence it explains",
    "Register — that the essay maintains one voice throughout"
  ],
  answer: 0,
  why: "It is not a quality word. That changes revision priorities: if one paragraph has three sentences of superb commentary and another has none, the fix is not to improve the good paragraph.",
  whyNot: [
    "Uniform excellence is not what the rubric asks for, and one weak explanation does not cap the row.",
    "Length is a useful rule of thumb and is not what the descriptor names.",
    "Voice belongs to the style skills."
  ]
},
{
  id: "qz-ro-commentary-02",
  conceptId: "ro-commentary",
  source: "Skill 6.A",
  stem: "What is the substitution that repairs most commentary?",
  options: [
    "Replace the quotation with a shorter one and explain more",
    "Replace ‘this shows' with a verb naming what the writer did, plus a ‘so that' clause",
    "Replace the claim with a narrower one the evidence can carry",
    "Replace the transition with one that names the relationship"
  ],
  answer: 1,
  why: "Relocates, concedes, narrows, redefines, delays — the verb forces analysis, and the clause forces reasoning. ‘This shows the author's point' names a relationship without describing it and would be equally true under any quotation.",
  whyNot: [
    "Shortening the quotation leaves the same empty sentence after it.",
    "Narrowing the claim is the arrival-test repair, for a different fault.",
    "Fixing a transition repairs a joint rather than the commentary itself."
  ]
},
{
  id: "qz-ro-commentary-03",
  conceptId: "ro-commentary",
  source: "Skill 6.A",
  stem: "What is the tell that a sentence is paraphrase rather than commentary?",
  options: [
    "It is shorter than the quotation it follows",
    "It repeats a word from the quotation",
    "It could be written by someone who had not read the rest of your essay",
    "It appears immediately after the quotation rather than later"
  ],
  answer: 2,
  why: "Commentary that mentions no claim of yours is paraphrase: it explains the quotation rather than explaining what the quotation does for your next claim.",
  whyNot: [
    "Length says nothing about whether a relationship was asserted.",
    "Repeating a key term is often exactly how commentary anchors itself.",
    "Position is where commentary belongs."
  ]
},
{
  id: "qz-ro-commentary-04",
  conceptId: "ro-commentary",
  source: "Skill 6.A",
  stem: "In the two-sentence shape for commentary, what does the first sentence do?",
  options: [
    "It names what the evidence is doing in the text, not what it says",
    "It restates the claim so the reader can locate it",
    "It introduces the quotation and attributes it",
    "It states what the argument can now proceed to"
  ],
  answer: 0,
  why: "The second sentence says what that makes available to the argument. The first is analysis and the second is line of reasoning — together they do the local job and the global one.",
  whyNot: [
    "Restating the claim is the disguised failure this shape is designed to avoid.",
    "Attribution belongs to the embedding of the evidence.",
    "That is the second sentence's job."
  ]
},

{
  id: "qz-ro-transitions-01",
  conceptId: "ro-transitions",
  source: "Skill 6.B",
  stem: "What counts as a transitional element?",
  options: [
    "Connective adverbs such as ‘however' and ‘furthermore'",
    "Words, phrases, clauses, sentences or whole paragraphs that show relationships among ideas",
    "The first sentence of each body paragraph",
    "Any repetition of a key term across a paragraph boundary"
  ],
  answer: 1,
  why: "The strongest transitions in a timed essay are not single words at all but short clauses that restate what has been established before adding the next thing — which is also why they are unfakeable.",
  whyNot: [
    "Connective adverbs are the smallest and least reliable case.",
    "A topic sentence may or may not be transitional.",
    "Repetition is a coherence device that need not state a relationship."
  ]
},
{
  id: "qz-ro-transitions-02",
  conceptId: "ro-transitions",
  source: "Skill 6.B",
  stem: "Why is a decorative ‘Furthermore' worse than no transition at all?",
  options: [
    "Because it wastes words that Row B could have used",
    "Because readers are trained to distrust connective adverbs",
    "Because it tells the reader a relationship exists that is not there",
    "Because it signals the writer has run out of evidence"
  ],
  answer: 2,
  why: "A missing transition leaves a link unstated; a false one sends the reader looking for something they cannot find, and the writing reads as confused rather than merely unconnected. Readers check the joints, which is exactly where the false sign was planted.",
  whyNot: [
    "Word count is not scored.",
    "There is no such trained distrust, and the same word can be perfectly accurate.",
    "It says nothing about how much evidence remains."
  ]
},
{
  id: "qz-ro-transitions-03",
  conceptId: "ro-transitions",
  source: "Skill 6.B",
  stem: "Which Reasoning and Organization skill is a reporting category in **two** rubric rows?",
  options: [
    "Skill 5.A, in Row A and Row B",
    "Skill 6.A, in Row B and Row C",
    "Skill 5.C, in Row B and Row C",
    "Skill 6.B, in Row B and Row C"
  ],
  answer: 3,
  why: "Transitional elements appear in Row B and in Row C on all three essays. That is not bookkeeping: connective tissue is where a reader perceives control, and a response whose joints are explicit sounds like one that knew where it was going.",
  whyNot: [
    "5.A is a reading skill and does not appear in Row A.",
    "6.A appears in Row B.",
    "5.C is the reading half of the methods pair."
  ]
},
{
  id: "qz-ro-transitions-04",
  conceptId: "ro-transitions",
  source: "Skill 6.B",
  stem: "How should you approach a transition question in the multiple-choice writing sets?",
  options: [
    "Work out the relationship in your own words before reading the options",
    "Pick the option that reads most fluently in context",
    "Pick the connective that appears least often in the passage",
    "Choose the shortest option, since brevity is rewarded"
  ],
  answer: 0,
  why: "Several options are usually grammatically fine and only one names the actual relationship. Choosing by ear selects the most impressive-sounding connective, which is how ‘nevertheless' gets picked for an addition.",
  whyNot: [
    "Fluency is what the distractors are built to have.",
    "Frequency in the passage is irrelevant.",
    "Length is not a criterion."
  ]
},

{
  id: "qz-ro-row-b-ladder-01",
  conceptId: "ro-row-b-ladder",
  source: "Q3 Row B",
  stem: "What moves a response from three Row B points to four?",
  options: [
    "Additional specific evidence supporting each claim",
    "Commentary that consistently explains how the evidence supports the reasoning",
    "A more clearly stated thesis at the top of the response",
    "A counterargument stated in its strongest form"
  ],
  answer: 1,
  why: "The evidence requirement is unchanged between those rungs. The decision rules confirm it from the other side: a typical three is one where commentary may fail to integrate some evidence or fail to support a key claim.",
  whyNot: [
    "More evidence cannot raise a score once it is specific and covers every claim.",
    "The thesis is Row A's business.",
    "Counterargument is a Row C route."
  ]
},
{
  id: "qz-ro-row-b-ladder-02",
  conceptId: "ro-row-b-ladder",
  source: "Q3 Row B",
  stem: "What is the one hard ceiling in Row B, and what standard does it apply?",
  options: [
    "Grammatical or mechanical errors that interfere with communication bar the fourth point",
    "Responses under a stated length cannot earn the fourth point",
    "Responses that omit a conclusion cannot earn the fourth point",
    "Responses using fewer than three sources cannot earn the fourth point"
  ],
  answer: 0,
  why: "The standard is interference with communication rather than tidiness, consistent with the course-level policy that small errors typical of unrevised timed writing do not hurt a score. It costs exactly one point, in this row only.",
  whyNot: [
    "No length requirement exists.",
    "A missing conclusion costs nothing in Row B.",
    "The source count is a Question 1 requirement and caps the row lower down, not at four."
  ]
},
{
  id: "qz-ro-row-b-ladder-03",
  conceptId: "ro-row-b-ladder",
  source: "Q3 Row B",
  stem: "In what two ways do the three Row B rubrics differ from one another?",
  options: [
    "Q1 counts sources; Q2 adds a rhetorical-choice requirement",
    "Q1 counts sources; Q3 relaxes the evidence requirement",
    "Q2 adds a rhetorical-choice requirement; Q3 adds a style requirement",
    "Q1 and Q2 require a counterargument; Q3 does not"
  ],
  answer: 0,
  why: "Q1 requires evidence from at least two sources for one point and at least three above that; Q2 requires at least one explained rhetorical choice at three points and multiple at four. Q3 has neither addition, and everything else about the ladder is identical.",
  whyNot: [
    "Q3's evidence requirement is the same as the others'.",
    "No question adds a style requirement to Row B.",
    "Counterargument belongs to Row C on all three."
  ]
},
{
  id: "qz-ro-row-b-ladder-04",
  conceptId: "ro-row-b-ladder",
  source: "Q3 Row B",
  stem: "A response sits at two points despite having plenty of evidence. What has gone wrong?",
  options: [
    "The evidence is accurate but drawn from too few sources",
    "The evidence is specific but the claims are too broad to support",
    "The evidence forms a pile rather than a progression",
    "The evidence is presented before the claims it supports"
  ],
  answer: 2,
  why: "The two-point decision rules describe a response that does not explain the connections between claims — a description of an essay that is full, not thin. Adding a fifth quotation changes nothing; adding one sentence at each joint changes the score.",
  whyNot: [
    "Source counts constrain Question 1 only, and up to two points.",
    "Broad claims are a separate problem and would show as unsupported rather than unconnected.",
    "Evidence-first paragraphs are a legitimate order."
  ]
},

{
  id: "qz-ro-drafting-under-time-01",
  conceptId: "ro-drafting-under-time",
  source: "Skill 6.A",
  stem: "Five minutes are left. Which is the best use of them?",
  options: [
    "Adding a fourth body paragraph",
    "Writing one commentary sentence in the paragraph that has none",
    "Extending the conclusion so the argument lands",
    "Adding a further quotation to the strongest paragraph"
  ],
  answer: 1,
  why: "It is a coverage repair, and coverage is exactly what the top Row B rung measures. A fourth paragraph without commentary is unintegrated evidence, and the conclusion is not a Row B lever at all.",
  whyNot: [
    "A new paragraph arriving without commentary has negative marginal value.",
    "The conclusion carries part of one point at most.",
    "More evidence in an already-strong paragraph raises nothing."
  ]
},
{
  id: "qz-ro-drafting-under-time-02",
  conceptId: "ro-drafting-under-time",
  source: "Skill 6.A",
  stem: "Which four-move paragraph template satisfies the CED's description of a body paragraph?",
  options: [
    "Claim naming what came before",
    "Topic sentence; three quotations; analysis; link back to the thesis",
    "Context; claim; counterargument; rebuttal",
    "Quotation; paraphrase; significance; transition"
  ],
  answer: 0,
  why: "The fourth move is the one that gets cut when time runs short, and it is the one Row B is counting — because it is what makes the paragraph part of a progression rather than an item on a list.",
  whyNot: [
    "Three quotations is a template the rubric never asks for.",
    "That is one possible paragraph, built around a concession.",
    "Paraphrase in the commentary slot is the failure the rubric prices at one point."
  ]
},
{
  id: "qz-ro-drafting-under-time-03",
  conceptId: "ro-drafting-under-time",
  source: "Skill 6.A",
  stem: "Fifteen minutes across six synthesis sources is about two and a half minutes each. What is the efficient use of that time?",
  options: [
    "Read each source fully and note its argument",
    "Read the two longest sources properly and skim the rest",
    "Decide your position early and read for what each source lets you claim",
    "Note one quotation from each source to guarantee coverage"
  ],
  answer: 2,
  why: "Two and a half minutes is enough to record a position and one usable specific, not enough to read a source properly. Row B rewards evidence supporting claims in a progression rather than a survey of what six sources think.",
  whyNot: [
    "There is not time to read six sources fully, and the reading period also has to serve the other passages.",
    "Length is a poor guide to usefulness.",
    "Coverage is a floor for eligibility rather than a strategy."
  ]
},
{
  id: "qz-ro-drafting-under-time-04",
  conceptId: "ro-drafting-under-time",
  source: "Skill 6.A",
  stem: "Why is starting to write before knowing paragraph two so costly?",
  options: [
    "Because the introduction will have to be rewritten later",
    "Because it produces the typical two-point profile",
    "Because the thesis cannot be stated until the second claim is known",
    "Because the reading period is wasted if drafting begins early"
  ],
  answer: 1,
  why: "No amount of good writing after minute fifteen repairs a structure chosen at minute one. ‘Throughout' is a claim about the whole essay, so it has to be decided before the first body paragraph.",
  whyNot: [
    "The introduction can stand, and rewriting it is cheap in any case.",
    "A thesis can be stated before the supporting claims are worked out.",
    "The reading period is spent on the sources, not on drafting."
  ]
},

/* ---- Style ---------------------------------------------------------------- */

{
  id: "qz-st-style-and-purpose-01",
  conceptId: "st-style-and-purpose",
  source: "Skill 7.A",
  stem: "What three-part shape should a sentence about style take?",
  options: [
    "Device → definition → example from the passage",
    "Quotation → paraphrase → judgement of effectiveness",
    "Choice → effect on this reader → service to this purpose",
    "Observation → comparison with another text → conclusion"
  ],
  answer: 2,
  why: "Drop the middle term and you have a list; drop the last and you have a description. Neither skill category says *identify*: one says explain how choices contribute to purpose, the other says advance an argument.",
  whyNot: [
    "Definition is the labelling step that earns nothing on its own.",
    "Paraphrase in the second slot is the standard collapse.",
    "Comparison with other texts is not available in an exam and is not what the skill asks."
  ]
},
{
  id: "qz-st-style-and-purpose-02",
  conceptId: "st-style-and-purpose",
  source: "Skill 7.A",
  stem: "What three things make up a writer's style, per the CED?",
  options: [
    "Word choice, syntax and conventions",
    "Tone, mood and register",
    "Diction, imagery and figurative language",
    "Voice, persona and point of view"
  ],
  answer: 0,
  why: "The mix of all three. Style is the point at which a text meets a particular audience rather than a generic one — which is why the audience appears in every good style sentence.",
  whyNot: [
    "Mood is a reader's state, and tone is one effect of the three named elements.",
    "Imagery and figurative language are instances of word choice rather than the categories.",
    "Voice and persona are results of these choices rather than the components."
  ]
},
{
  id: "qz-st-style-and-purpose-03",
  conceptId: "st-style-and-purpose",
  source: "Skill 7.A",
  stem: "Why is ‘the passage has a formal style' a weak claim?",
  options: [
    "Because formality is a matter of genre rather than choice",
    "Because nothing in the text could contradict it",
    "Because style claims must name a device",
    "Because formality is not one of the CED's style elements"
  ],
  answer: 1,
  why: "A claim that cannot fail cannot be evidence. The stronger version names what the formality lets the writer do that plainness would not.",
  whyNot: [
    "Genre constrains formality without removing the writer's decisions within it.",
    "Naming a device is the thing the rubric declines to reward.",
    "Formality is an aspect of word choice and syntax, both of which are named."
  ]
},
{
  id: "qz-st-style-and-purpose-04",
  conceptId: "st-style-and-purpose",
  source: "Skill 7.A",
  stem: "How can you tell you are writing about the subject rather than the style?",
  options: [
    "Your sentence quotes more than five words at a time",
    "Your sentence mentions the audience rather than the writer",
    "Your sentence would still be true if the writer had used completely different words",
    "Your sentence names an emotion rather than a technique"
  ],
  answer: 2,
  why: "‘The author cares deeply about clean water' is a fact about the author. ‘The author never calls it water — it is always drinking water, which keeps a body at the other end of the pipe in view' is a fact about the writing.",
  whyNot: [
    "Quotation length is a matter of economy rather than of what you are analysing.",
    "The audience belongs in a style sentence; the effect on them is the middle term.",
    "Emotions can be the effect, provided the words that produce them are named."
  ]
},

{
  id: "qz-st-diction-01",
  conceptId: "st-diction",
  source: "Skill 7.A",
  stem: "What is the substitution test for diction?",
  options: [
    "Replace the word with a neutral synonym and read the sentence again",
    "Replace the word with its dictionary definition and check the sense survives",
    "Replace the word with the writer's own word from elsewhere in the passage",
    "Replace the word with a stronger one and see whether the tone breaks"
  ],
  answer: 0,
  why: "Whatever changed is the connotative work the original word was doing, and that difference is your evidence. ‘The committee buried the proposal' keeps the denotation of ‘rejected' and adds quiet, final and faintly shameful.",
  whyNot: [
    "A definition supplies the denotation, which is exactly the part that does not change.",
    "Another of the writer's words carries its own connotations and muddies the comparison.",
    "Escalating the word tests intensity rather than isolating the loading."
  ]
},
{
  id: "qz-st-diction-02",
  conceptId: "st-diction",
  source: "Skill 7.A",
  stem: "How do readers arrive at a writer's tone?",
  options: [
    "From the writer's stated attitude in the opening paragraph",
    "From the subject matter, which carries its own emotional weight",
    "From the genre, which fixes the range of available tones",
    "By inferring it from word choice, especially connotation"
  ],
  answer: 3,
  why: "Tone is not announced; it is accumulated, word by word, and the reader adds it up. That is why the diction concept comes before the tone concept and not the other way round.",
  whyNot: [
    "Writers rarely state their attitude, and a stated one may be ironic.",
    "Reading the topic's weight as the writer's attitude is the standard tone error.",
    "Genre allows a wide range, and the choice within it is the analysable thing."
  ]
},
{
  id: "qz-st-diction-03",
  conceptId: "st-diction",
  source: "Skill 7.A",
  stem: "A writer describing a budget uses *starve*, *bleed*, *skeleton* and *life support*. What have you found?",
  options: [
    "Four instances of negative diction, which should be listed",
    "A metaphor built out of diction: an institution as a body being killed",
    "An appeal to emotion, which should be named as pathos",
    "A tone shift, since the register drops across the passage"
  ],
  answer: 1,
  why: "One loaded word is a choice; six from the same family is a design. Patterns beat single words, and this pattern has smuggled in a claim without stating one.",
  whyNot: [
    "Listing them is the failure the concept warns against, and it stops before the design is named.",
    "Naming an appeal is a label, and the same objection applies.",
    "Nothing here indicates a change across the passage."
  ]
},
{
  id: "qz-st-diction-04",
  conceptId: "st-diction",
  source: "Skill 7.A",
  stem: "Why is precision itself a stylistic choice?",
  options: [
    "Because precise writing is always clearer than vague writing",
    "Because the rubric credits accuracy of quotation",
    "Because ‘31 of the 42 clinics' performs accuracy and buys credibility",
    "Because precise figures are harder for an opponent to dispute"
  ],
  answer: 2,
  why: "A writer choosing that over ‘most clinics' is not merely being accurate; they are doing something to an audience that distrusts vagueness. Vagueness can be chosen too, by a writer who needs room to retreat later.",
  whyNot: [
    "Clarity is a general virtue and not what makes precision a rhetorical choice.",
    "Quotation accuracy is a mechanics matter.",
    "Disputability is a property of the fact rather than of the choice to state it precisely."
  ]
},

{
  id: "qz-st-comparisons-01",
  conceptId: "st-comparisons",
  source: "Skill 7.A",
  stem: "What are the three steps for unpacking a comparison?",
  options: [
    "Identify the type; find a second instance; name the effect",
    "Name the two terms; name which properties transfer; state the claim you have accepted",
    "Quote it; paraphrase it; evaluate whether it is apt",
    "Name the tenor; name the vehicle; name the ground"
  ],
  answer: 1,
  why: "A metaphor never lends all the properties of its second term; it lends the ones the writer needs and hopes you will not audit the rest. Stating the claim as a sentence with a verb is what makes the compression visible.",
  whyNot: [
    "Classifying the figure is the labelling step that earns nothing.",
    "Evaluating aptness is a judgement rather than an analysis of the transfer.",
    "The terminology is accurate and stops short of naming the claim."
  ]
},
{
  id: "qz-st-comparisons-02",
  conceptId: "st-comparisons",
  source: "Skill 7.A",
  stem: "‘The debt is a chain around our children's necks.' What is the analytical opportunity beyond unpacking it?",
  options: [
    "Auditing the transfer — naming what the comparison suppresses",
    "Identifying whether it is a metaphor or a simile",
    "Counting how often the image recurs in the passage",
    "Judging whether the image is original or a cliché"
  ],
  answer: 0,
  why: "A chain is placed on you by an enemy; a debt is often incurred on your behalf for things you inherit too. The comparison suppresses that, and explaining what the suppression is *for* is a Row C route on Question 2.",
  whyNot: [
    "The classification adds nothing once the transfer is named.",
    "Frequency is data, and the concept has already been established by one instance.",
    "Originality is a stylistic judgement rather than an account of the argument."
  ]
},
{
  id: "qz-st-comparisons-03",
  conceptId: "st-comparisons",
  source: "Skill 7.A",
  stem: "Why do writers reach for analogy when they expect resistance, and metaphor when they do not?",
  options: [
    "Because analogy is more formal and suits a hostile occasion",
    "Because an analogy is explicit and therefore easier to attack",
    "Because metaphor is shorter and suits an impatient audience",
    "Because analogy requires shared knowledge and metaphor does not"
  ],
  answer: 1,
  why: "An analogy is the same machinery run at greater length with an explicit structure — A is to B as C is to D. Being explicit means it can be examined, which is what a resistant reader will want.",
  whyNot: [
    "Formality is not what distinguishes them.",
    "Length matters less than whether the structure is visible.",
    "Both require the audience to hold the second term."
  ]
},
{
  id: "qz-st-comparisons-04",
  conceptId: "st-comparisons",
  source: "Skill 7.A",
  stem: "‘The author uses a metaphor comparing the debt to a chain, which creates a vivid image.' What is wrong?",
  options: [
    "The metaphor is misidentified; it is a simile",
    "The quotation is too short to support the claim",
    "The image is a cliché and cannot be analysed",
    "‘Vivid image' is a compliment rather than an effect"
  ],
  answer: 3,
  why: "The effect of a comparison is always a claim the reader accepted without being asked to. State that claim.",
  whyNot: [
    "The identification is correct, and correctness is not what is missing.",
    "Quotation length is not the problem.",
    "Familiar images can be analysed exactly as fresh ones can."
  ]
},

{
  id: "qz-st-tone-01",
  conceptId: "st-tone",
  source: "Skill 7.A",
  stem: "Why is ‘angry' a weak tone word and ‘exasperated' a strong one?",
  options: [
    "Because ‘exasperated' is specific enough to be wrong",
    "Because ‘angry' describes the reader rather than the writer",
    "Because ‘exasperated' is a more formal register",
    "Because ‘angry' names an emotion and tone is not emotional"
  ],
  answer: 0,
  why: "Exasperation is a specific thing you can prove from a text — it implies the writer has said this before. A tone word you could not argue against earns nothing.",
  whyNot: [
    "Both describe the writer's attitude; that is what tone is.",
    "Register is irrelevant to whether the claim is defensible.",
    "Tone is precisely an attitude, and emotional words are the usual vocabulary for it."
  ]
},
{
  id: "qz-st-tone-02",
  conceptId: "st-tone",
  source: "Skill 7.A",
  stem: "A passage about a massacre is written flatly. Is the tone ‘horrified'?",
  options: [
    "Yes — the subject fixes the tone regardless of the writing",
    "Yes, provided the flatness is sustained throughout",
    "No — that reads the topic's weight as the writer's attitude",
    "No — flatness indicates the absence of tone"
  ],
  answer: 2,
  why: "The flatness is the choice, and it is what should be written about. Reading a topic's emotional weight as the writer's attitude is the second commonest tone error.",
  whyNot: [
    "Nothing about a subject fixes the attitude taken towards it.",
    "Sustained flatness makes the point stronger, not weaker.",
    "Flatness is a tone, and often a deliberate one."
  ]
},
{
  id: "qz-st-tone-03",
  conceptId: "st-tone",
  source: "Skill 7.A",
  stem: "‘The tone is about the dangers of social media.' What has been answered instead of tone?",
  options: [
    "The purpose",
    "The subject",
    "The message",
    "The exigence"
  ],
  answer: 1,
  why: "A tone answer must be an attitude word that could sit in the sentence ‘the writer sounds ___ about it'. This one names what the passage is about instead.",
  whyNot: [
    "Purpose would name what the writer wants to happen.",
    "Message would be what the writer says about the dangers.",
    "Exigence would be what prompted the writing."
  ]
},
{
  id: "qz-st-tone-04",
  conceptId: "st-tone",
  source: "Skill 7.A",
  stem: "How does tone differ from a writer's position?",
  options: [
    "Position is explicit and tone is always implicit",
    "Position belongs to the argument and tone to the genre",
    "Position is what the writer claims; tone is the attitude in which the claiming is done",
    "Position can change within a text and tone cannot"
  ],
  answer: 2,
  why: "A writer can be gentle about something they intend to destroy. Keeping the two apart is also what makes irony analysable, since a persona's tone and the writer's attitude to that persona can be opposite.",
  whyNot: [
    "Both can be explicit or implicit.",
    "Genre constrains tone without owning it.",
    "Tone shifts are a standard and high-value feature to analyse."
  ]
},

{
  id: "qz-st-tone-shift-irony-01",
  conceptId: "st-tone-shift-irony",
  source: "Skill 7.A",
  stem: "‘The tone shifts from serious to very serious.' What has gone wrong?",
  options: [
    "Both halves are the same attitude at different volumes",
    "The shift has been located in the wrong paragraph",
    "‘Serious' is a subject rather than an attitude",
    "A shift requires at least three stages to count"
  ],
  answer: 0,
  why: "That is emphasis, not a shift. A shift changes the writer's relationship to their own claim — qualifying it, refining it, or reconsidering it.",
  whyNot: [
    "Location is not what makes the observation empty.",
    "‘Serious' is an attitude word, and the trouble is that both halves name the same one.",
    "Two stages are all a shift requires."
  ]
},
{
  id: "qz-st-tone-shift-irony-02",
  conceptId: "st-tone-shift-irony",
  source: "Skill 7.A",
  stem: "Why is a tone shift worth more than a single device?",
  options: [
    "Because shifts are rarer and therefore harder to spot",
    "Because a shift is a relationship between choices",
    "Because shifts always occur at structural boundaries",
    "Because a shift proves the writer revised the passage"
  ],
  answer: 1,
  why: "Question 2's Row C refuses the point to responses that examine individual rhetorical choices without examining the relationships among choices throughout the text. A shift is exactly such a relationship, handed to you.",
  whyNot: [
    "Rarity is not what the rubric rewards.",
    "Shifts often occur mid-paragraph, and location is not the point.",
    "Nothing about the finished text reveals its drafting."
  ]
},
{
  id: "qz-st-tone-shift-irony-03",
  conceptId: "st-tone-shift-irony",
  source: "Skill 7.A",
  stem: "What must you show to prove irony?",
  options: [
    "A word whose connotation contradicts its denotation",
    "The writer's known views from outside the passage",
    "A shift in register between two paragraphs",
    "Both edges of the gap: the surface, and what makes it impossible to take at face value"
  ],
  answer: 3,
  why: "Evidence for irony is never a single word — it is a mismatch. Praise attached to something already shown to be shabby; a calm register applied to something monstrous.",
  whyNot: [
    "A single loaded word is diction rather than irony.",
    "Outside knowledge is unavailable and unnecessary.",
    "A register shift may accompany irony without demonstrating it."
  ]
},
{
  id: "qz-st-tone-shift-irony-04",
  conceptId: "st-tone-shift-irony",
  source: "Skill 7.A",
  stem: "‘In the fourth paragraph the tone shifts to hopeful.' What is still owed?",
  options: [
    "What the hope does to the argument",
    "A quotation from the fourth paragraph",
    "The name of the device that produces the shift",
    "Whether the shift is sustained to the end"
  ],
  answer: 0,
  why: "Which claim it narrows, which objection it answers, which action it is trying to make thinkable for this audience. Locating a shift and stopping earns nothing.",
  whyNot: [
    "Evidence is needed and would still leave the observation unexplained.",
    "A device name adds a label rather than an explanation.",
    "Duration is a detail, and the effect is the missing part."
  ]
},

{
  id: "qz-st-syntax-emphasis-01",
  conceptId: "st-syntax-emphasis",
  source: "Skill 7.B",
  stem: "Where are the strong positions in an English sentence?",
  options: [
    "The middle, where the main clause usually sits",
    "The end, then the beginning, plus wherever a pattern breaks",
    "Wherever the longest clause falls",
    "Immediately after any punctuation mark"
  ],
  answer: 1,
  why: "A break costs the writer nothing to place and is where they want your attention. But the strong-position claim only works if you say what was displaced.",
  whyNot: [
    "The middle is the weakest position, which is where writers put what they must include and would rather not stress.",
    "Length attracts attention without conferring emphasis.",
    "Punctuation marks a boundary rather than creating a strong position."
  ]
},
{
  id: "qz-st-syntax-emphasis-02",
  conceptId: "st-syntax-emphasis",
  source: "Skill 7.B",
  stem: "Why does a strong-position claim need the displaced alternative?",
  options: [
    "Because the rubric requires two quotations per claim",
    "Because the alternative shows the writer's first draft",
    "Because without it you have described the sentence rather than shown a choice",
    "Because comparison is a listed method of development"
  ],
  answer: 2,
  why: "‘She ends the sentence on *stranded*' is weak. ‘She could have written that people on the far side are stranded and inconvenienced, and instead she ends on the harsher word' is evidence.",
  whyNot: [
    "No such requirement exists.",
    "The alternative is your construction, not a claim about drafting.",
    "Methods of development are a different skill."
  ]
},
{
  id: "qz-st-syntax-emphasis-03",
  conceptId: "st-syntax-emphasis",
  source: "Skill 7.B",
  stem: "Against what should sentence length be measured?",
  options: [
    "The passage's own norm",
    "An average of about twenty words",
    "The length of the surrounding paragraphs",
    "The formality of the genre"
  ],
  answer: 0,
  why: "Length is only meaningful as a contrast. A twelve-word sentence is short in one passage and unremarkable in another, and ‘the author uses a short sentence for emphasis' names no object either way.",
  whyNot: [
    "There is no ideal length to measure against.",
    "Paragraph length is a separate feature.",
    "Genre conventions vary too widely to serve as a baseline."
  ]
},
{
  id: "qz-st-syntax-emphasis-04",
  conceptId: "st-syntax-emphasis",
  source: "Skill 7.B",
  stem: "Which syntactic move does the CED describe as adding non-essential material that may address an audience's needs?",
  options: [
    "Delay, which withholds the main clause until the end",
    "Accumulation, which piles details after the main clause",
    "Balance, which places two clauses of similar shape side by side",
    "Interruption, by dash or parenthesis"
  ],
  answer: 3,
  why: "The interruption is audible: it can sound like a concession, an aside to an ally, or a second thought. That audibility is what makes it analysable rather than decorative.",
  whyNot: [
    "Delay holds the reader in suspense so the payoff lands in the strong final position.",
    "Accumulation gives the point early and fills it in after.",
    "Balance asserts that the contents are comparable."
  ]
},

{
  id: "qz-st-coordination-subordination-01",
  conceptId: "st-coordination-subordination",
  source: "Skill 7.B",
  stem: "‘Although the programme cost 40,000 dollars, it served 200 students.' What has the syntax done?",
  options: [
    "Made the cost the concession and the service the point",
    "Made the service the concession and the cost the point",
    "Given the two facts equal billing",
    "Denied the cost without stating a reason"
  ],
  answer: 0,
  why: "Reverse the clauses and the same two facts become an attack. Nothing was added and nothing denied — the whole argument lives in one conjunction and one clause boundary.",
  whyNot: [
    "That is the reversed version, which reads as a criticism.",
    "Equal billing is what coordination would give.",
    "The cost is stated plainly; it is simply not where the sentence ends."
  ]
},
{
  id: "qz-st-coordination-subordination-02",
  conceptId: "st-coordination-subordination",
  source: "Skill 7.B",
  stem: "Is putting an opposing fact in an ‘although' clause a sign of weakness?",
  options: [
    "Yes — it concedes ground the writer cannot recover",
    "Yes, unless the clause is answered later in the paragraph",
    "No — the fact is visibly present while the structure keeps the last word",
    "No, provided the clause is short enough to be skimmed"
  ],
  answer: 2,
  why: "It is conceding without losing, and a subordinate clause is the most economical qualifier there is: the reader can see the writer is not hiding the fact.",
  whyNot: [
    "The ground is not lost — it is ranked.",
    "No later answer is required for the move to work.",
    "Length has nothing to do with it, and a skimmed concession would fail to buy credibility."
  ]
},
{
  id: "qz-st-coordination-subordination-03",
  conceptId: "st-coordination-subordination",
  source: "Skill 7.B",
  stem: "What does the rewrite test involve?",
  options: [
    "Rewriting the sentence in your own words to check comprehension",
    "Re-ranking the sentence to see what the writer avoided",
    "Rewriting the sentence without its modifiers",
    "Rewriting the sentence as two short ones"
  ],
  answer: 1,
  why: "Swap which fact sits in the dependent clause. The facts stay and the argument flips, which is what shows the ranking was doing the persuasive work.",
  whyNot: [
    "Paraphrase checks your reading rather than the writer's choice.",
    "Stripping modifiers tests a different feature.",
    "Splitting the sentence removes the ranking rather than exposing it."
  ]
},
{
  id: "qz-st-coordination-subordination-04",
  conceptId: "st-coordination-subordination",
  source: "Skill 7.B",
  stem: "Applied to your own draft, what does the rank test catch?",
  options: [
    "Sentences that are too long to parse in one pass",
    "Clauses whose punctuation is technically incorrect",
    "Repetition of a conjunction across consecutive sentences",
    "The point you most want kept sitting in a dependent clause"
  ],
  answer: 3,
  why: "If your best sentence is buried in an ‘although', you have ranked your own argument wrongly. Correctly labelling a clause as subordinate earns nothing; saying which idea got demoted, and why that serves the purpose, is the mark.",
  whyNot: [
    "Parsing difficulty is a clarity failure with its own test.",
    "Punctuation correctness is a mechanics matter.",
    "Repetition is a coherence device rather than a ranking error."
  ]
},

{
  id: "qz-st-punctuation-01",
  conceptId: "st-punctuation",
  source: "Skill 7.C",
  stem: "What relationship does a colon assert?",
  options: [
    "A promise and its delivery",
    "A contrast between two equal clauses",
    "An interruption that can be skipped",
    "A pause weaker than a full stop and stronger than a comma"
  ],
  answer: 0,
  why: "What follows explains, lists or proves what preceded. It is the most argumentative mark, because it claims a logical relationship without spending a word on it.",
  whyNot: [
    "Contrast between equals is closer to the semicolon's work.",
    "Skippable material is what parentheses claim.",
    "That describes the semicolon's weight rather than the colon's relationship."
  ]
},
{
  id: "qz-st-punctuation-02",
  conceptId: "st-punctuation",
  source: "Skill 7.C",
  stem: "What does putting material in parentheses claim about it?",
  options: [
    "That it was added after the sentence was drafted",
    "That it is not essential to understanding what it describes",
    "That it comes from a source rather than the writer",
    "That it should be read in a different voice"
  ],
  answer: 1,
  why: "It is a claim about rank — and writers sometimes use that to slip a large admission past a reader quietly, which is worth noticing when it happens.",
  whyNot: [
    "Composition history is invisible in a finished text.",
    "Attribution is done by citation rather than by brackets.",
    "A change of voice is what dashes tend to stage."
  ]
},
{
  id: "qz-st-punctuation-03",
  conceptId: "st-punctuation",
  source: "Skill 7.C",
  stem: "Four punctuation options in a writing-set item are all grammatically acceptable. What are you choosing between?",
  options: [
    "Which is most common in published prose",
    "Which produces the shortest sentence",
    "Which relationship matches the purpose stated in the item",
    "Which the passage uses elsewhere"
  ],
  answer: 2,
  why: "Hunting for the ‘correct' one fails, because more than one is correct. The stated purpose is the whole question.",
  whyNot: [
    "Frequency in published prose is not the criterion.",
    "Brevity is not scored.",
    "Consistency with the passage may be a tiebreak and is not the test."
  ]
},
{
  id: "qz-st-punctuation-04",
  conceptId: "st-punctuation",
  source: "Skill 7.C",
  stem: "Why are italics described as the cheap way to emphasise?",
  options: [
    "Because they are informal and rare in serious prose",
    "Because they cannot be reproduced in a handwritten exam",
    "Because they do not require the sentence to be rearranged",
    "Because they emphasise a word rather than an idea"
  ],
  answer: 2,
  why: "Emphasis is imposed by the page rather than by the sentence — so a writer who uses them often is telling you they could not do it structurally.",
  whyNot: [
    "They are ordinary in serious prose.",
    "The exam is typed in any case, and reproducibility is not the point.",
    "Any emphasis lands on a word; the question is what produced it."
  ]
},

{
  id: "qz-st-naming-vs-effect-01",
  conceptId: "st-naming-vs-effect",
  source: "Q2 Row B",
  stem: "What are the three parts of a complete unit of rhetorical analysis?",
  options: [
    "The device named; an example; a judgement of effectiveness",
    "The specific words quoted; the effect on a reader; the service to purpose for this audience",
    "The claim; the evidence; the commentary",
    "The rhetorical situation; the choice; the outcome"
  ],
  answer: 1,
  why: "The middle part is the one students skip, going from quotation straight to purpose. Repetition does not *show* determination; it produces persistence in the ear, and a reader who has heard persistence is readier to believe in it.",
  whyNot: [
    "Naming and judging is the one-point behaviour.",
    "That is the shape of a body paragraph rather than of an analytical unit.",
    "The rhetorical situation frames the analysis without being one of its three parts."
  ]
},
{
  id: "qz-st-naming-vs-effect-02",
  conceptId: "st-naming-vs-effect",
  source: "Q2 Row B",
  stem: "May a response reach four points in Q2 Row B using several instances of the **same** device?",
  options: [
    "Yes, if each instance further contributes to the argument, purpose or message",
    "No — ‘multiple rhetorical choices' requires different devices",
    "Yes, but only if at least two other devices are also discussed",
    "No — repeated instances count once however they are explained"
  ],
  answer: 0,
  why: "The Additional Notes say so directly. Three instances of one move, each doing different work, qualifies — and is usually a better essay than six unrelated labels.",
  whyNot: [
    "Variety is not required, which is worth knowing before you go hunting for it.",
    "No such minimum exists.",
    "Each instance counts when it contributes further."
  ]
},
{
  id: "qz-st-naming-vs-effect-03",
  conceptId: "st-naming-vs-effect",
  source: "Q2 Row B",
  stem: "Which of these is a real effect rather than a fake one?",
  options: [
    "It creates a vivid image for the reader",
    "It drives the point home and adds emphasis",
    "It shows the author's passion for the subject",
    "It makes the audience's own doubt the thing being answered"
  ],
  answer: 3,
  why: "An effect has to be a change in the reader — what they now expect, believe, feel obliged to, or cannot unsee. If your effect clause could be pasted onto any device in any passage, it is not about this passage.",
  whyNot: [
    "‘Vivid image' is a compliment and fits anything.",
    "Both halves of this are pure filler.",
    "The author's feelings are not a change in the reader."
  ]
},
{
  id: "qz-st-naming-vs-effect-04",
  conceptId: "st-naming-vs-effect",
  source: "Q2 Row B",
  stem: "A response identifies six devices, quotes a line for each, labels it and explains none. What is the ceiling?",
  options: [
    "Four points, since six choices exceeds ‘multiple'",
    "Three points, since the evidence is specific",
    "One point, because it performs the one-point behaviour six times",
    "Two points, since quantity partially compensates"
  ],
  answer: 2,
  why: "The three-point line requires explanation, not quantity. A device hunt costs time and buys the bottom band; two moves explained properly reach the top two.",
  whyNot: [
    "‘Multiple' applies to choices that are explained.",
    "Specific quotation without explanation is exactly the one-point description.",
    "Nothing in the rubric trades quantity for explanation."
  ]
},

{
  id: "qz-st-your-own-style-01",
  conceptId: "st-your-own-style",
  source: "Skill 8.A",
  stem: "Which Row C route is earned by your own prose on all three essays?",
  options: [
    "Articulating the implications or limitations of an argument",
    "Employing a style that is consistently vivid and persuasive",
    "Crafting a nuanced argument by exploring complexities",
    "Explaining the significance of the writer's rhetorical choices"
  ],
  answer: 1,
  why: "It is the only route earned by the whole response rather than by a passage of it, and the one you can practise in advance.",
  whyNot: [
    "That route appears on Questions 1 and 3 and concerns the argument rather than the prose.",
    "Nuance is a Question 1 and 3 route about the argument's content.",
    "That is a Question 2 route about the passage."
  ]
},
{
  id: "qz-st-your-own-style-02",
  conceptId: "st-your-own-style",
  source: "Skill 8.A",
  stem: "Is reaching for bigger vocabulary a safe bet for Row C?",
  options: [
    "Yes — vivid style is a listed route and vocabulary is part of it",
    "Yes, provided the words are used correctly",
    "No — the rules refuse the point for language ineffective because it does not enhance the argument",
    "No, because vocabulary is assessed in Row B rather than Row C"
  ],
  answer: 2,
  why: "Long words used approximately are worse than short words used exactly, and a reader can always tell. Ineffective complexity is a listed failure rather than a neutral.",
  whyNot: [
    "Vividness that does not advance the argument is the disqualifying behaviour, not the route.",
    "Correct use is necessary and not sufficient — the words must do work.",
    "Vocabulary bears on Row C through style; Row B concerns evidence and commentary."
  ]
},
{
  id: "qz-st-your-own-style-03",
  conceptId: "st-your-own-style",
  source: "Skill 8.A",
  stem: "Which habit is recommended for timed prose?",
  options: [
    "One comparison, developed across the essay",
    "Several comparisons, so the range of thought is visible",
    "No comparisons, since they invite disagreement",
    "A comparison in the introduction and another in the conclusion"
  ],
  answer: 0,
  why: "A single metaphor sustained becomes a way of thinking rather than a flourish — and the second term still has to be one your reader already holds.",
  whyNot: [
    "Five scattered comparisons read as decoration.",
    "Comparisons are named explicitly in the skill.",
    "Bookending is scattering with extra symmetry."
  ]
},
{
  id: "qz-st-your-own-style-04",
  conceptId: "st-your-own-style",
  source: "Skill 8.A",
  stem: "Why is a vivid opening followed by four paragraphs of ‘aspects' and ‘factors' a problem?",
  options: [
    "Because abstract nouns are barred by the conventions skill",
    "Because ‘consistently' is in the rubric, and the opening now reads as rehearsed",
    "Because an introduction should be plainer than the body",
    "Because the rubric compares your style with the passage's"
  ],
  answer: 1,
  why: "Style is the route earned by the whole response. Abstractions are also where an argument goes to become unfalsifiable: a reader cannot picture *factors*.",
  whyNot: [
    "No word is barred; the objection is that placeholders say little.",
    "There is no rule about the introduction's register.",
    "Your style is judged on its own terms."
  ]
},

{
  id: "qz-st-clear-sentences-01",
  conceptId: "st-clear-sentences",
  source: "Skill 8.B",
  stem: "‘Writing with enormous restraint, the passage never names the victim.' What is the error?",
  options: [
    "A pronoun with no clear owner",
    "A subject and verb driven apart",
    "The main point buried in a dependent clause",
    "A modifier attached to the nearest noun, which is the wrong one"
  ],
  answer: 3,
  why: "The passage did not write anything. Readers attach a modifier to whatever is nearest, automatically — so the fix is to move it rather than to add words.",
  whyNot: [
    "No pronoun appears in the sentence.",
    "The subject and verb are adjacent.",
    "There is no dependent clause here."
  ]
},
{
  id: "qz-st-clear-sentences-02",
  conceptId: "st-clear-sentences",
  source: "Skill 8.B",
  stem: "When is a long sentence sophisticated?",
  options: [
    "When its length carries a relationship a short one could not",
    "When it contains at least two subordinate clauses",
    "When it appears at the end of a paragraph",
    "When its vocabulary matches the passage being analysed"
  ],
  answer: 0,
  why: "A concession, a sequence, a qualification. Length used as costume is precisely what the Row C decision rules name and refuse — and a grader rereading a sentence to parse it is not reading it as thought.",
  whyNot: [
    "Clause count measures construction rather than work done.",
    "Position does not confer sophistication.",
    "Matching the passage's vocabulary is imitation rather than control."
  ]
},
{
  id: "qz-st-clear-sentences-03",
  conceptId: "st-clear-sentences",
  source: "Skill 8.B",
  stem: "In commentary, what does an unowned ‘this' usually mark?",
  options: [
    "A quotation that has been trimmed too far",
    "The exact place where the explanation was going to go and did not",
    "A transition that has been omitted",
    "A claim that belongs in the previous paragraph"
  ],
  answer: 1,
  why: "‘This shows that…' — *this* what? The pronoun points back at a whole sentence because the writer had not yet decided which part of it mattered.",
  whyNot: [
    "Quotation length is a separate matter.",
    "A missing transition leaves a gap between paragraphs rather than inside a sentence.",
    "Misplacement is a structural problem with a different symptom."
  ]
},
{
  id: "qz-st-clear-sentences-04",
  conceptId: "st-clear-sentences",
  source: "Skill 8.B",
  stem: "Where exactly does clarity have a hard floor in the rubric?",
  options: [
    "In Row A, where a vague thesis earns nothing",
    "In Row C, where ineffective complexity is refused",
    "In Row B, where errors interfering with communication bar the fourth point",
    "In every row, since all three require comprehensible writing"
  ],
  answer: 2,
  why: "It conditions exactly one point — the fourth in that row, and nowhere else. A response whose errors interfere can still take three of Row B's four.",
  whyNot: [
    "Row A concerns whether a defensible position was stated.",
    "Row C's objection is to complexity that does not enhance the argument, which is a different standard.",
    "Only Row B carries the note, which is why the cost is bounded."
  ]
},

{
  id: "qz-st-your-conventions-01",
  conceptId: "st-your-conventions",
  source: "Skill 8.C",
  stem: "In the last five minutes, what should you hunt first?",
  options: [
    "Sentences that do not parse",
    "Commas and apostrophes",
    "Spelling of proper nouns",
    "Paragraph breaks that arrive too late"
  ],
  answer: 0,
  why: "They are the only errors the rubric actually prices. Commas cost nothing until they obscure meaning, and eight minutes hunting them costs commentary, which is worth four points.",
  whyNot: [
    "Punctuation comes last, and only if there is time.",
    "Spelling is in the same bottom tier.",
    "Paragraphing is not assessed as a convention."
  ]
},
{
  id: "qz-st-your-conventions-02",
  conceptId: "st-your-conventions",
  source: "Skill 8.C",
  stem: "What kind of grammatical error does the CED say hurts performance?",
  options: [
    "Any error a careful reader would notice",
    "Errors so prevalent and significant as to interfere with communication",
    "Errors in quotation and attribution only",
    "Errors repeated more than three times in one response"
  ],
  answer: 1,
  why: "Small errors typical of unrevised timed writing are stated not to hurt the score. The excuse does not stretch to sentences that cannot be parsed, and it has no bearing on Row C.",
  whyNot: [
    "Noticeability is not the standard.",
    "Quotation mechanics matter and are not the stated criterion.",
    "No count is specified."
  ]
},
{
  id: "qz-st-your-conventions-03",
  conceptId: "st-your-conventions",
  source: "Skill 8.C",
  stem: "Why is 8.C a reporting category for Row C on all three essays?",
  options: [
    "Because Row C checks punctuation and spelling directly",
    "Because conventions errors cap Row C at zero",
    "Because control of conventions is part of a consistently vivid and persuasive style",
    "Because Row C rewards the longest and most complex sentences"
  ],
  answer: 2,
  why: "A sentence whose punctuation fights it cannot be persuasive, whatever its vocabulary.",
  whyNot: [
    "Row C does not audit mechanics as such.",
    "There is no such cap; the priced ceiling is the fourth point of Row B.",
    "Ineffective complexity is a listed Row C failure."
  ]
},
{
  id: "qz-st-your-conventions-04",
  conceptId: "st-your-conventions",
  source: "Skill 8.C",
  stem: "What should you assume about the digital exam's writing tools?",
  options: [
    "That spell check will catch typing errors",
    "That a word count will help you budget length",
    "That formatting tools are available for emphasis",
    "That nothing catches your typing for you, so reread instead"
  ],
  answer: 3,
  why: "The essays are typed in Bluebook, and what the free-response editor offers could not be established from an official source in this centre's research. Plan on having none of it rather than trusting a tool that may not be there.",
  whyNot: [
    "Its availability is exactly what could not be confirmed.",
    "Same objection, and length is not scored in any case.",
    "Emphasis by formatting is the cheap route even where it exists."
  ]
},

{
  id: "qz-st-sophistication-01",
  conceptId: "st-sophistication",
  source: "Q2 Row C",
  stem: "How many points is Row C worth on each essay, and what is the recommended strategy?",
  options: [
    "One point; choose one route and run it through the whole essay",
    "One point; touch all four routes so at least one lands",
    "Two points; develop two routes in parallel",
    "One point; save the sophistication for the conclusion"
  ],
  answer: 0,
  why: "The word doing the work in three of the routes is *consistently*, so a route touched once cannot satisfy them. If you choose tension, it appears in the thesis, is developed in two body paragraphs, and is what the conclusion resolves.",
  whyNot: [
    "Touching all four spreads each too thin to be consistent.",
    "Row C is worth one point on all three essays.",
    "A final flourish is the commonest shape of a failed Row C."
  ]
},
{
  id: "qz-st-sophistication-02",
  conceptId: "st-sophistication",
  source: "Q2 Row C",
  stem: "Which is a Row C route on Question 2 but not on Questions 1 and 3?",
  options: [
    "Employing a style that is consistently vivid and persuasive",
    "Articulating the implications or limitations of an argument",
    "Explaining a purpose or function of the passage's complexities or tensions",
    "Crafting a nuanced argument by exploring complexities or tensions"
  ],
  answer: 2,
  why: "Question 2's routes concern the passage, because the argument being judged is an analysis rather than a position. Its other two are explaining the significance of the writer's choices, and style.",
  whyNot: [
    "Style is a route on all three.",
    "That route belongs to Questions 1 and 3.",
    "Nuance in the student's own argument is likewise a Question 1 and 3 route."
  ]
},
{
  id: "qz-st-sophistication-03",
  conceptId: "st-sophistication",
  source: "Q2 Row C",
  stem: "What does the Row C Additional Note require?",
  options: [
    "That the sophistication appear in more than one paragraph",
    "That the sophistication be part of the argument, not merely a phrase or reference",
    "That the response exceed a stated length",
    "That the response earn all four Row B points first"
  ],
  answer: 1,
  why: "Structurally that means it has to be visible before the last paragraph, or a grader has no reason to believe it belongs to the argument at all.",
  whyNot: [
    "The requirement is about integration rather than a count of paragraphs.",
    "No length is specified anywhere in the rubric.",
    "The rows are scored independently."
  ]
},
{
  id: "qz-st-sophistication-04",
  conceptId: "st-sophistication",
  source: "Q2 Row C",
  stem: "Row C's reporting categories include 4.C, the qualification skill. What is the rubric telling you?",
  options: [
    "That qualification is assessed twice, in Row A and Row C",
    "That a qualified thesis is required for the sophistication point",
    "That the sophistication point and the qualification skill are the same habit of mind",
    "That modifiers should be counted when scoring Row C"
  ],
  answer: 2,
  why: "Bounding an argument, complicating it, and connecting it to something that changes what it means are the operations Row C rewards — and qualification is the one most within a student's control.",
  whyNot: [
    "Row A concerns defensibility rather than qualification.",
    "No route requires a qualified thesis specifically.",
    "Nothing in Row C is counted."
  ]
},

{
  id: "qz-st-sophistication-traps-01",
  conceptId: "st-sophistication-traps",
  source: "Q3 Row C",
  stem: "What is the paste test for a context sentence?",
  options: [
    "Paste it into an essay on a different prompt and see whether it still fits",
    "Paste it into your conclusion and check that it still reads",
    "Paste it after each body paragraph to test coherence",
    "Paste it into the thesis and check the sentence still parses"
  ],
  answer: 0,
  why: "If it still fits, it has situated nothing. The rubric's objection to a sweeping generalisation is not that it is a cliché but that a generalisation broad enough to open any essay has done no work.",
  whyNot: [
    "Readability in a second position proves nothing about what it contributes.",
    "Coherence is a different property with its own tests.",
    "Grammatical fit says nothing about content."
  ]
},
{
  id: "qz-st-sophistication-traps-02",
  conceptId: "st-sophistication-traps",
  source: "Q3 Row C",
  stem: "Which two failure modes appear on Question 2's Row C but not on Questions 1 and 3?",
  options: [
    "Sweeping generalisations, and hinting at other arguments",
    "Ineffective complexity, and vocabulary chosen for size",
    "Announcing complexity, and quoting a famous person",
    "Examining choices without their relationships, and oversimplifying complexities"
  ],
  answer: 3,
  why: "Both are about the passage rather than about the student's own argument, which is what Question 2's Row C judges. A writer who admires and distrusts the same institution is doing a job on the audience, and route 2 asks you to say what job.",
  whyNot: [
    "Both of those appear across all three questions.",
    "Ineffective complexity is listed on all three.",
    "Neither of those appears on any list at all."
  ]
},
{
  id: "qz-st-sophistication-traps-03",
  conceptId: "st-sophistication-traps",
  source: "Q3 Row C",
  stem: "Does a rhetorical question in the conclusion earn Row C?",
  options: [
    "Yes — it demonstrates engagement with the reader",
    "Yes, provided it is not answered",
    "No — it appears on none of the lists, and one sentence cannot be consistent",
    "No, unless the same question opened the essay"
  ],
  answer: 2,
  why: "It is a flourish, and the Additional Note excludes mere phrases. The same applies to a famous quotation, an unusually long final paragraph, and vocabulary chosen for size.",
  whyNot: [
    "Engagement is not one of the routes.",
    "Whether it is answered makes no difference.",
    "Bookending it would still be a flourish."
  ]
},
{
  id: "qz-st-sophistication-traps-04",
  conceptId: "st-sophistication-traps",
  source: "Q3 Row C",
  stem: "What is the deepest misconception about Row C?",
  options: [
    "That it is a tone to adopt — a more serious voice and a grander finish",
    "That it is only available to the strongest writers",
    "That it requires vocabulary beyond the student's ordinary range",
    "That it must be attempted in every paragraph"
  ],
  answer: 0,
  why: "It is not a register. It is a set of operations performed on your own argument — bounding it, complicating it, connecting it to something that changes what it means — and you can perform every one of them in plain short sentences.",
  whyNot: [
    "The routes are available to any response, and style is the most practisable of them.",
    "Vocabulary chosen for size is a listed failure rather than a requirement.",
    "One route run through the essay is the recommendation, not saturation."
  ]
},

/* ---- The exam, and how it is scored --------------------------------------- */

{
  id: "qz-rb-exam-shape-01",
  conceptId: "rb-exam-shape",
  source: "Exam format",
  stem: "Roughly how does one rubric point compare with one multiple-choice question?",
  options: [
    "They are worth about the same",
    "A rubric point is worth about three multiple-choice questions",
    "A multiple-choice question is worth about three rubric points",
    "A rubric point is worth about ten multiple-choice questions"
  ],
  answer: 1,
  why: "45% over 45 questions makes one question about 1% of the exam; 55% over the 18 rubric points makes one point about 3%. That is why the thesis sentence repays more practice than its length suggests.",
  whyNot: [
    "Equality would need the essays to carry 45 points rather than 18.",
    "This inverts the ratio.",
    "Ten would need the essays to be worth far more than 55%."
  ]
},
{
  id: "qz-rb-exam-shape-02",
  conceptId: "rb-exam-shape",
  source: "Exam format",
  stem: "Is the 15-minute reading period added to the 2 hours 15 minutes for Section II?",
  options: [
    "Yes — it precedes the writing time",
    "Yes, but only on the digital exam",
    "No — it is inside it, leaving exactly 3 × 40 minutes of writing",
    "No, but it may be skipped to gain writing time"
  ],
  answer: 2,
  why: "15 + 40 + 40 + 40 = 135 minutes, exactly. There is no slack in Section II: every minute overspent on one essay is taken from another.",
  whyNot: [
    "Adding it would make the section 2 hours 30.",
    "The timing is the same either way.",
    "Skipping it does not extend the section, and the material still has to be read."
  ]
},
{
  id: "qz-rb-exam-shape-03",
  conceptId: "rb-exam-shape",
  source: "Exam format",
  stem: "How is the multiple-choice section built?",
  options: [
    "As 45 independent items sampled across the eight skill categories",
    "As two reading sets and three writing sets attached to five stimulus texts",
    "As one long passage with 45 questions attached",
    "As three sets matching the three free-response tasks"
  ],
  answer: 1,
  why: "The two reading sets carry 11–14 questions each and assess skills 1, 3, 5 and 7; the three writing sets carry 7–9, 7–9 and 4–6 and assess skills 2, 4, 6 and 8.",
  whyNot: [
    "The items come in sets attached to texts rather than singly.",
    "Five stimulus texts are used, not one.",
    "The sets do not map onto the essay tasks."
  ]
},
{
  id: "qz-rb-exam-shape-04",
  conceptId: "rb-exam-shape",
  source: "Exam format",
  stem: "Can any skill category be safely skipped in revision?",
  options: [
    "Yes — the two lowest-weighted categories are worth under 5% each",
    "Yes — the writing categories are covered by essay practice alone",
    "No — categories 3 and 5 are worth 13–16% each and the rest 11–14%",
    "No — every category is worth exactly one eighth of the section"
  ],
  answer: 2,
  why: "The per-category weighting is narrow, so nothing is small enough to ignore. Categories 3 and 5 are the joint-largest.",
  whyNot: [
    "No category falls below 11%.",
    "The writing categories are assessed in the multiple-choice revision sets too.",
    "The weightings are ranges rather than equal shares."
  ]
},

{
  id: "qz-rb-analytic-rubric-01",
  conceptId: "rb-analytic-rubric",
  source: "Exam format",
  stem: "An essay has flawless evidence and commentary and genuine sophistication, but its thesis only restates the prompt. What is the maximum score?",
  options: [
    "6, since the quality of the body compensates",
    "3, since a missing thesis undermines the rest",
    "4, since Row C also requires a thesis",
    "5 — the rows are scored independently"
  ],
  answer: 3,
  why: "Nothing in Rows B or C can repay a missing Row A. The one sentence you did not write costs a point the rest of the essay is not allowed to earn back.",
  whyNot: [
    "There is no compensation between rows.",
    "Rows B and C are unaffected by the thesis.",
    "Row C does not depend on Row A."
  ]
},
{
  id: "qz-rb-analytic-rubric-02",
  conceptId: "rb-analytic-rubric",
  source: "Exam format",
  stem: "Which row has a middle, and why does that matter?",
  options: [
    "Row A, which can be awarded in halves",
    "Row C, which has partial credit for partial sophistication",
    "All three, since each is scored on a scale",
    "Row B alone — Rows A and C are all or nothing"
  ],
  answer: 3,
  why: "Row B holds four of the six points, and it is the only row with intermediate steps. There is no partial credit for a thesis that nearly works, which is what makes the thesis worth two deliberate minutes.",
  whyNot: [
    "Row A is one point or none.",
    "Row C is likewise binary.",
    "Only Row B is scaled."
  ]
},
{
  id: "qz-rb-analytic-rubric-03",
  conceptId: "rb-analytic-rubric",
  source: "Exam format",
  stem: "Why not score each essay holistically, with a single impression score?",
  options: [
    "Because holistic scoring takes longer to apply",
    "Because it hides its reasoning, so a student cannot tell which behaviour to change",
    "Because it would produce lower scores overall",
    "Because it cannot distinguish reading tasks from writing tasks"
  ],
  answer: 1,
  why: "Two readers can differ and neither can point at what produced the number. The analytic rubric replaces the impression with yes-or-no questions about things visibly on the page.",
  whyNot: [
    "Holistic scoring is faster, which is its main attraction.",
    "It is not systematically harsher.",
    "The task distinction is made by the prompts rather than the scoring method."
  ]
},
{
  id: "qz-rb-analytic-rubric-04",
  conceptId: "rb-analytic-rubric",
  source: "Exam format",
  stem: "What is the commonest way a fluent, confident essay loses a point it could have had?",
  options: [
    "It never puts a defensible claim in a single sentence",
    "It uses too few quotations to satisfy Row B",
    "It concedes too much to the opposing view",
    "It runs past the recommended length"
  ],
  answer: 0,
  why: "There is no row for impressive. Marks arrive in three separate boxes, and a fluent essay that never states a position has written itself out of the first one.",
  whyNot: [
    "Quotation counts matter only on Question 1, and only up to two points.",
    "Concession is a Row C route rather than a risk.",
    "Length is not scored."
  ]
},

{
  id: "qz-rb-row-a-thesis-01",
  conceptId: "rb-row-a-thesis",
  source: "Q1 Row A",
  stem: "‘In this essay I will examine three sources and explain both perspectives.' Why does this earn nothing?",
  options: [
    "It refers to the essay in the first person",
    "It promises three sources rather than the required minimum",
    "It summarises the sources rather than quoting them",
    "A plan is not a position"
  ],
  answer: 3,
  why: "It responds to the prompt and is perfectly grammatical. If your thesis contains the words *this essay*, rewrite it so it contains a verb the other side could deny.",
  whyNot: [
    "The first person is not prohibited.",
    "Three is the minimum for the upper Row B rows, so the number is fine.",
    "Nothing has been summarised yet."
  ]
},
{
  id: "qz-rb-row-a-thesis-02",
  conceptId: "rb-row-a-thesis",
  source: "Q1 Row A",
  stem: "Which decision rule appears on Question 2's Row A but not on Questions 1 and 3?",
  options: [
    "Equivocating or summarising other people's arguments",
    "Failing to address the writer's rhetorical choices",
    "Stating an obvious fact rather than a claim requiring defence",
    "Taking no position, or a position that must be inferred"
  ],
  answer: 1,
  why: "Question 2's row also lists describing or repeating the passage. A thesis taking a position on the passage's subject rather than on the writer's choices earns nothing there, however defensible the position is.",
  whyNot: [
    "Equivocation is listed on Question 1.",
    "The obvious-fact rule appears on Questions 1 and 3.",
    "So does the vague-position rule."
  ]
},
{
  id: "qz-rb-row-a-thesis-03",
  conceptId: "rb-row-a-thesis",
  source: "Q1 Row A",
  stem: "Which of these is a **convention** rather than a rule?",
  options: [
    "That the thesis must respond to the prompt",
    "That the thesis must present a defensible position",
    "That the thesis must be a single sentence in the first paragraph",
    "That the thesis on Question 2 must address rhetorical choices"
  ],
  answer: 2,
  why: "The notes permit a thesis anywhere in the response and allow more than one sentence in close proximity. Neither placement nor a three-reason preview is required.",
  whyNot: [
    "Responding to the prompt is one of the four zero conditions.",
    "Defensibility is the criterion itself.",
    "That requirement is printed in Question 2's descriptor."
  ]
},
{
  id: "qz-rb-row-a-thesis-04",
  conceptId: "rb-row-a-thesis",
  source: "Q1 Row A",
  stem: "Q1 and Q2 Row A carry five Additional Notes; Q3 carries four. Which is missing from Q3?",
  options: [
    "That the thesis may appear anywhere in the response",
    "That the thesis may be more than one sentence",
    "That the point is awarded regardless of whether the essay supports it",
    "That the sources or passage must contain minimal supporting evidence"
  ],
  answer: 3,
  why: "Question 3 provides neither sources nor a passage, so there is nothing for that note to point at — which also means a Question 3 thesis is bounded only by what you can go on to evidence yourself.",
  whyNot: [
    "That note appears on all three.",
    "So does the multiple-sentence note.",
    "So does the independence note."
  ]
},

{
  id: "qz-rb-row-b-evidence-01",
  conceptId: "rb-row-b-evidence",
  source: "Q1 Row B",
  stem: "A Question 1 response uses two sources brilliantly. What is its Row B ceiling?",
  options: [
    "One point",
    "Two points",
    "Three points",
    "Four points, since quality outweighs the count"
  ],
  answer: 0,
  why: "At least three of the provided sources is the entry requirement for two, three and four. Everything above one point is barred to a two-source response however well it uses them.",
  whyNot: [
    "Two points requires at least three sources.",
    "So does three.",
    "The count is a hard floor rather than a preference."
  ]
},
{
  id: "qz-rb-row-b-evidence-02",
  conceptId: "rb-row-b-evidence",
  source: "Q1 Row B",
  stem: "If any quotation in your essay is sitting unexplained, where does Row B stop?",
  options: [
    "At two points",
    "At one point",
    "At three points",
    "It does not stop; unexplained evidence is neutral"
  ],
  answer: 2,
  why: "The three-point description says commentary may fail to integrate some evidence or fail to support a key claim. Four requires that the explaining be consistent.",
  whyNot: [
    "Two points describes an essay with no line of reasoning established.",
    "One point describes summary rather than explanation.",
    "Unintegrated evidence is exactly what the descriptor prices."
  ]
},
{
  id: "qz-rb-row-b-evidence-03",
  conceptId: "rb-row-b-evidence",
  source: "Q1 Row B",
  stem: "A response has eight quotations with one sentence of explanation each; another has four, each explained to the claim. Which scores higher?",
  options: [
    "The eight-quotation response, since evidence is counted",
    "The four-quotation response, since the climb above the minimum is all commentary",
    "They tie, since both have specific evidence",
    "Neither can be judged without knowing the thesis"
  ],
  answer: 1,
  why: "Above the source minimum, more evidence raises nothing. The climb from two to four is entirely in the commentary column.",
  whyNot: [
    "Only Question 1 counts sources, and only for eligibility.",
    "Specific evidence is a floor rather than the differentiator.",
    "The thesis belongs to a different row."
  ]
},
{
  id: "qz-rb-row-b-evidence-04",
  conceptId: "rb-row-b-evidence",
  source: "Q1 Row B",
  stem: "Which point can grammatical and mechanical errors cost you, and under what condition?",
  options: [
    "Any point in any row, if the errors are frequent",
    "The Row C point, since style must be effective",
    "The Row A point, if the thesis itself is unclear",
    "The fourth point in Row B, and only if the errors interfere with communication"
  ],
  answer: 3,
  why: "It bars one point in one row. It does not reduce Row A or Row C, and small errors typical of unrevised timed writing are stated not to hurt the score at all.",
  whyNot: [
    "Frequency alone is not the standard; interference is.",
    "Row C's objection is to complexity that does not enhance the argument.",
    "An unclear thesis fails Row A on its own terms rather than through this note."
  ]
},

{
  id: "qz-rb-row-c-sophistication-01",
  conceptId: "rb-row-c-sophistication",
  source: "Q3 Row C",
  stem: "How does Question 1's version of the Row C routes differ from Question 3's?",
  options: [
    "It asks for complexities across the sources and allows the sources' arguments to be situated",
    "It offers three routes where Question 3 offers four",
    "It omits the style route, since Question 1 is source-based",
    "It requires two routes rather than one"
  ],
  answer: 0,
  why: "The shape is the same; the scope differs. Question 1 also adds ‘throughout the response' to the rhetorical-choices route and prints its four as bullets rather than numbers.",
  whyNot: [
    "Three routes is Question 2's list.",
    "Style is a route on all three.",
    "One route, run consistently, is what the rubric rewards."
  ]
},
{
  id: "qz-rb-row-c-sophistication-02",
  conceptId: "rb-row-c-sophistication",
  source: "Q3 Row C",
  stem: "Which three failures appear on every version of Row C?",
  options: [
    "Oversimplifying, examining choices in isolation, and summarising",
    "Sweeping generalisations, hinting at other arguments, and ineffective complexity",
    "Vague theses, missing conclusions, and unexplained quotations",
    "Naming devices, counting sources, and previewing structure"
  ],
  answer: 1,
  why: "The rubric's own examples of the first are ‘In a world where…' and ‘Since the beginning of time…'; of the second, ‘While some may argue that…'. The third is language that does not enhance the argument or analysis.",
  whyNot: [
    "The first two of those are Question 2-only failures.",
    "Those belong to Rows A and B.",
    "None of those appears on any Row C list."
  ]
},
{
  id: "qz-rb-row-c-sophistication-03",
  conceptId: "rb-row-c-sophistication",
  source: "Q3 Row C",
  stem: "Why is reaching for harder sentences a bad Row C strategy?",
  options: [
    "Because complex sentences take longer to write than they are worth",
    "Because the rubric prefers a plain register throughout",
    "Because difficulty is not evidence of thought, and the rules exclude ineffective complexity",
    "Because complexity is credited in Row B instead"
  ],
  answer: 2,
  why: "A reader who has to reread your sentence has been given a reason to withhold the point rather than to award it. The exclusion is printed on all three versions of the row.",
  whyNot: [
    "Time cost is real and is not the rubric's objection.",
    "No register is preferred; effectiveness is the criterion.",
    "Row B concerns evidence and commentary."
  ]
},
{
  id: "qz-rb-row-c-sophistication-04",
  conceptId: "rb-row-c-sophistication",
  source: "Q3 Row C",
  stem: "In what three printed ways does Question 2's Row C differ from the others'?",
  options: [
    "It has three routes; its descriptor says ‘develops' a complex understanding; its note says ‘part of the argument'",
    "It has five routes; it omits style; it requires two failures to be avoided",
    "It is worth two points; it names the passage; it excludes counterargument",
    "It has four routes; it adds a source requirement; it omits the generalisation exclusion"
  ],
  answer: 0,
  why: "It also adds two failure modes the others lack: examining individual choices without their relationships, and oversimplifying complexities in the text.",
  whyNot: [
    "It has three routes and includes style.",
    "Row C is one point on all three.",
    "It has three routes and no source requirement."
  ]
},

{
  id: "qz-rb-three-tasks-01",
  conceptId: "rb-three-tasks",
  source: "Exam format",
  stem: "Which skill appears in the CED's alignment for Question 2 but not for Questions 1 and 3?",
  options: [
    "4.C, qualifying a claim",
    "6.C, choosing a method of development",
    "8.A, using words and syntax to convey a tone",
    "1.A, identifying components of the rhetorical situation"
  ],
  answer: 3,
  why: "That one extra code is the whole difference between analysing a text and arguing about a topic. Everything else in Question 2's list is shared.",
  whyNot: [
    "4.C is shared across all three.",
    "So is 6.C.",
    "So is 8.A."
  ]
},
{
  id: "qz-rb-three-tasks-02",
  conceptId: "rb-three-tasks",
  source: "Exam format",
  stem: "What is the source of evidence on each of the three questions?",
  options: [
    "Six sources; one passage; nothing provided",
    "Six sources; six sources; one passage",
    "One passage; one passage; six sources",
    "Nothing provided on any — all evidence is the student's"
  ],
  answer: 0,
  why: "Question 1 requires at least three of its six sources, clearly indicated. Question 2 supplies one passage of roughly 600–800 words, to be analysed rather than agreed with. Question 3 supplies nothing.",
  whyNot: [
    "Only Question 1 supplies sources.",
    "This reverses the first two.",
    "Two of the three supply material."
  ]
},
{
  id: "qz-rb-three-tasks-03",
  conceptId: "rb-three-tasks",
  source: "Exam format",
  stem: "The CED defines *synthesize* as combining perspectives from sources to form what?",
  options: [
    "A balanced survey of the available positions",
    "A support of a coherent position",
    "A summary of the strongest source",
    "A comparison of the sources' methods"
  ],
  answer: 1,
  why: "Support of *a position*, not a survey. Reading the task verbs as instructions rather than vocabulary is what stops Question 1 turning into a tour of what six people think.",
  whyNot: [
    "A balanced survey is the equivocation failure in another dress.",
    "Summary is priced at one point in Row B.",
    "Comparing methods is not what the verb asks for."
  ]
},
{
  id: "qz-rb-three-tasks-04",
  conceptId: "rb-three-tasks",
  source: "Exam format",
  stem: "Why is writing Question 2 as though it were Question 3 so tempting, and what does it cost?",
  options: [
    "The passage makes claims worth arguing with, and Row A pays only for a thesis about choices",
    "The passage is shorter than the sources, so there is time to spare",
    "The prompt uses the same wording as Question 3's",
    "The rubric rewards agreement with the passage's position"
  ],
  answer: 0,
  why: "The rubric also names describing or repeating the passage as a way of not earning the point. The prompt's ‘to' — choices made *to* achieve a purpose — is the whole task.",
  whyNot: [
    "Time is not what produces the error.",
    "The prompts are worded quite differently.",
    "Agreement is beside the point on a rhetorical analysis."
  ]
},

{
  id: "qz-rb-forty-minutes-01",
  conceptId: "rb-forty-minutes",
  source: "Exam format",
  stem: "You finish Question 1 twelve minutes late. What have you actually spent?",
  options: [
    "Twelve minutes of your reading period",
    "Twelve minutes that the section's buffer absorbs",
    "Nothing, provided the essay is stronger for it",
    "Twelve minutes of Question 2 or Question 3"
  ],
  answer: 3,
  why: "120 minutes divides into exactly three 40-minute essays and nothing separates them. The safest essay to protect is Question 3, which supplies no material to fall back on.",
  whyNot: [
    "The reading period comes first and is already spent.",
    "There is no buffer.",
    "The essay you are enjoying is usually the one already earning most of its available points."
  ]
},
{
  id: "qz-rb-forty-minutes-02",
  conceptId: "rb-forty-minutes",
  source: "Exam format",
  stem: "Which essay is most damaged by being rushed, and why?",
  options: [
    "Question 1, because it has six sources to handle",
    "Question 2, because rhetorical analysis is the hardest task",
    "Question 3, because it supplies no material to fall back on",
    "All three equally, since they share a rubric"
  ],
  answer: 2,
  why: "Questions 1 and 2 hand you the material, so a rushed one still has something to quote. A rushed Question 3 has no evidence at all, and generalities are exactly what its one-point level describes.",
  whyNot: [
    "Six sources are demanding and still present on the page.",
    "Difficulty is not the same as fragility under time pressure.",
    "The shared rubric is what makes the difference in supplied material decisive."
  ]
},
{
  id: "qz-rb-forty-minutes-03",
  conceptId: "rb-forty-minutes",
  source: "Exam format",
  stem: "Why can Row C not be written last, as a final flourish?",
  options: [
    "Because the conclusion is not read if time is called",
    "Because the rubric awards it only when the complexity is part of the argument",
    "Because Row C is scored before Row B",
    "Because the sophistication point requires a second thesis statement"
  ],
  answer: 1,
  why: "It has to be decided while you plan rather than while you conclude — which is why the recommended allocation puts five minutes into deciding the position and the claims before any writing.",
  whyNot: [
    "Everything written is read.",
    "The order of scoring is irrelevant.",
    "No second thesis is required anywhere."
  ]
},
{
  id: "qz-rb-forty-minutes-04",
  conceptId: "rb-forty-minutes",
  source: "Exam format",
  stem: "With three minutes left, is it better to add a quotation or to check the ones you have?",
  options: [
    "Add a quotation, since evidence is counted in Row B",
    "Add a quotation, since a new source may raise the count",
    "Check the ones you have, since an unexplained quotation holds Row B at three",
    "Neither — spend the time on the conclusion"
  ],
  answer: 2,
  why: "Adding evidence moves nothing once the source minimum is met. That final sweep is the highest-value minute in the essay.",
  whyNot: [
    "Counting applies to sources on Question 1 and stops at two points.",
    "A source added in the last three minutes will arrive unexplained.",
    "The conclusion is not a Row B lever."
  ]
},

{
  id: "qz-rb-reading-period-01",
  conceptId: "rb-reading-period",
  source: "Exam format",
  stem: "Roughly how much reading is waiting in Question 1, and what does that imply for the 15 minutes?",
  options: [
    "About 2,000 words plus two graphics, which is the whole period",
    "About 800 words, leaving most of the period for the other questions",
    "About 4,000 words, which cannot be read in the time",
    "About 1,200 words, leaving five minutes for Question 3"
  ],
  answer: 0,
  why: "Six sources — two visual, the rest text excerpts of about 500 words each — at roughly 130 words a minute. That is careful reading with a pen in hand, and it is why the period belongs mostly to Question 1.",
  whyNot: [
    "800 words is closer to the Question 2 passage alone.",
    "The period is sized for the material, not overwhelmed by it.",
    "1,200 words would leave the sources half read."
  ]
},
{
  id: "qz-rb-reading-period-02",
  conceptId: "rb-reading-period",
  source: "Exam format",
  stem: "In what order should the reading period be used?",
  options: [
    "Sources first, then the Question 1 prompt, so the reading is unbiased",
    "The Question 1 prompt first, then the sources, then a glance at Question 3",
    "All three prompts first, then whichever sources time allows",
    "Question 2's passage first, since it is the hardest task"
  ],
  answer: 1,
  why: "Knowing what position you are looking for changes what you notice in the sources. Question 3 needs no reading beyond its prompt, and thinking about it early costs nothing.",
  whyNot: [
    "Unbiased reading is slower and produces a survey rather than a position.",
    "Reading all three prompts first delays the material that actually needs the time.",
    "Question 2's passage is shorter and can be read when you reach it."
  ]
},
{
  id: "qz-rb-reading-period-03",
  conceptId: "rb-reading-period",
  source: "Exam format",
  stem: "Why is spreading the fifteen minutes evenly across the three questions a mistake?",
  options: [
    "Because Question 2's passage is longer than the six sources combined",
    "Because the period is officially assigned to Question 1",
    "Because Question 3 supplies no text, so an even split reads nothing while leaving Question 1 half absorbed",
    "Because Questions 2 and 3 may not be opened during the period"
  ],
  answer: 2,
  why: "Question 1 is also the one whose Row B has a hard floor of three sources, so its material is the material you cannot afford to have half read.",
  whyNot: [
    "The passage is 600–800 words against roughly 2,000.",
    "No official assignment is made.",
    "No such restriction is stated."
  ]
},
{
  id: "qz-rb-reading-period-04",
  conceptId: "rb-reading-period",
  source: "Exam format",
  stem: "What does the CED actually say you may do during the reading period?",
  options: [
    "That you may annotate but not draft",
    "That you may draft an outline on the scratch paper",
    "That you may begin writing the essay itself",
    "Only that Section II includes one 15-minute reading period"
  ],
  answer: 3,
  why: "It defines the task verb *Read* as looking at or viewing printed directions and provided passages, and says no more. Plan on reading, annotating and thinking rather than drafting, and check the instructions on the day.",
  whyNot: [
    "The prohibition is not stated.",
    "Nor is the permission.",
    "Nothing in the CED addresses this either way."
  ]
},

{
  id: "qz-rb-bluebook-01",
  conceptId: "rb-bluebook",
  source: "Exam format",
  stem: "The essays are typed in Bluebook. What changes about how they are scored?",
  options: [
    "Nothing — the same rows, points, timings and weightings",
    "Handwriting legibility is replaced by a formatting criterion",
    "Length becomes measurable and is therefore assessed",
    "Mechanical errors are penalised more heavily"
  ],
  answer: 0,
  why: "What genuinely changes is the economics of revision: reordering is free, so you can write body paragraphs in whatever order they come and then move them so each claim follows from the one before.",
  whyNot: [
    "No formatting criterion exists.",
    "Length is not scored on either medium.",
    "The same interference standard applies."
  ]
},
{
  id: "qz-rb-bluebook-02",
  conceptId: "rb-bluebook",
  source: "Exam format",
  stem: "What are the keyboard requirements on the day?",
  options: [
    "An external keyboard is optional on any device",
    "An external keyboard is required on a tablet and not permitted on a laptop",
    "An external keyboard is required on a laptop and optional on a tablet",
    "External keyboards are not permitted at all"
  ],
  answer: 1,
  why: "Which is why you should practise on the machine and keyboard you will actually use. The device also needs to hold a charge for four hours, and scratch paper is provided rather than brought.",
  whyNot: [
    "It is required in one case and forbidden in the other.",
    "This reverses the two.",
    "They are required for tablet testing."
  ]
},
{
  id: "qz-rb-bluebook-03",
  conceptId: "rb-bluebook",
  source: "Exam format",
  stem: "Can you rely on spell check in the Bluebook response editor?",
  options: [
    "Yes — it is standard in the digital exam",
    "Yes, but it is disabled during the reading period",
    "No — it is explicitly disabled for the free-response section",
    "Unknown — no official source could be read that states which features the editor offers"
  ],
  answer: 3,
  why: "Plan as though there are none. Typing invites longer sentences and faster drafting, which is where errors that interfere with communication actually come from.",
  whyNot: [
    "Its presence is exactly what could not be established.",
    "Nor is any such timing rule known.",
    "No source establishes a prohibition either."
  ]
},
{
  id: "qz-rb-bluebook-04",
  conceptId: "rb-bluebook",
  source: "Exam format",
  stem: "Name one thing typing genuinely changes about drafting.",
  options: [
    "Reordering is free, so paragraphs can be moved into a line of reasoning",
    "Quotations can be copied directly from the sources",
    "Longer essays become possible and are rewarded",
    "Handwriting speed no longer limits how much evidence you use"
  ],
  answer: 0,
  why: "It also makes the final sweep for unexplained quotations cheap, because inserting a sentence of commentary no longer costs you a margin.",
  whyNot: [
    "Copying is not available, and quotations are still typed by hand.",
    "Length is not rewarded.",
    "Typing speed replaces handwriting speed without changing what evidence is worth."
  ]
},

/* ---- The device reference ------------------------------------------------- */

{
  id: "qz-dv-naming-earns-nothing-01",
  conceptId: "dv-naming-earns-nothing",
  source: "Q2 Row B",
  stem: "What is the one-line test for whether a sentence of yours is analysis or labelling?",
  options: [
    "Count the words devoted to the quotation against the explanation",
    "Delete the device name and see whether the sentence still says something",
    "Check whether the device is named accurately",
    "Check whether the sentence mentions the audience"
  ],
  answer: 1,
  why: "If deleting the name empties the sentence, the sentence was a label. If it survives, you were doing analysis and the name was a shortcut.",
  whyNot: [
    "Proportion is a useful habit and does not test what a sentence asserts.",
    "Accuracy of naming is not what earns credit.",
    "Mentioning the audience helps and can still accompany an empty claim."
  ]
},
{
  id: "qz-dv-naming-earns-nothing-02",
  conceptId: "dv-naming-earns-nothing",
  source: "Q2 Row B",
  stem: "An essay's paragraphs are organised one on diction, one on syntax, one on appeals. What does that usually indicate?",
  options: [
    "A response that will cover the passage systematically",
    "A response using comparison-contrast as its method",
    "A response whose organising principle came from the glossary",
    "A response that has planned for Row C by grouping choices"
  ],
  answer: 2,
  why: "It is almost always a list wearing an essay's clothes. Organise by what the writer is doing and its stages, and let the devices appear wherever they fall.",
  whyNot: [
    "Systematic coverage of categories is not coverage of the argument.",
    "No comparison is being made between two cases.",
    "Row C asks for relationships among choices, which category buckets tend to prevent."
  ]
},
{
  id: "qz-dv-naming-earns-nothing-03",
  conceptId: "dv-naming-earns-nothing",
  source: "Q2 Row B",
  stem: "Row B scores Evidence AND Commentary together. What follows?",
  options: [
    "You cannot earn the row on evidence alone",
    "Evidence and commentary are each worth two of the four points",
    "A response with no quotations cannot earn commentary credit",
    "The row is scored twice and the higher score kept"
  ],
  answer: 0,
  why: "Quoting is evidence; naming what the quoted words are doing grammatically is arguably still evidence. Commentary begins where you say what the choice does to a reader and how that serves the purpose.",
  whyNot: [
    "The row is not split into two halves of two points.",
    "Commentary requires something to explain, and the row is scored as a whole.",
    "It is scored once, against the descriptors."
  ]
},
{
  id: "qz-dv-naming-earns-nothing-04",
  conceptId: "dv-naming-earns-nothing",
  source: "Q2 Row B",
  stem: "Where does the sixth point live, on the ladder that runs from naming to Row C?",
  options: [
    "In naming several devices accurately across the whole passage",
    "In explaining one choice's effect in unusual depth",
    "In quoting from every paragraph of the passage",
    "In explaining how several choices work together for this audience"
  ],
  answer: 3,
  why: "Naming earns nothing, explaining one choice's effect earns Row B credit, and Question 2's Row C refuses the point to responses that examine individual choices without examining the relationships among them.",
  whyNot: [
    "Accurate naming is the bottom rung whatever its coverage.",
    "Depth on one choice is Row B work.",
    "Coverage of the passage is not a criterion."
  ]
},

{
  id: "qz-dv-diction-01",
  conceptId: "dv-diction",
  source: "Skill 7.A",
  stem: "How do you tell understatement from litotes?",
  options: [
    "Litotes is spoken and understatement is written",
    "Litotes is ironic and understatement is sincere",
    "Litotes negates the opposite; understatement need not",
    "Litotes applies to people and understatement to events"
  ],
  answer: 2,
  why: "‘Not spotless' and ‘no small matter' are litotes. All litotes is understatement; most understatement is not litotes. No negation, no litotes.",
  whyNot: [
    "Both appear in speech and writing.",
    "Both can be either ironic or sincere.",
    "Neither is restricted by subject."
  ]
},
{
  id: "qz-dv-diction-02",
  conceptId: "dv-diction",
  source: "Skill 7.A",
  stem: "What does a euphemism do to a reader?",
  options: [
    "It leaves the act intact and removes the word that would have triggered objection",
    "It exaggerates the act so the reader reads past it to the writer's intensity",
    "It shrinks the scale of the act so the reader judges it minor",
    "It substitutes a technical term so the reader defers to expertise"
  ],
  answer: 0,
  why: "A reader scanning the text finds nothing to object to. The analysis is always the gap between the substitute and the plain word.",
  whyNot: [
    "That is hyperbole.",
    "That is understatement, which alters the scale rather than the vocabulary of objection.",
    "Jargon can do that and is a different move."
  ]
},
{
  id: "qz-dv-diction-03",
  conceptId: "dv-diction",
  source: "Skill 7.A",
  stem: "‘The author's diction is powerful and emotional.' What is the definitive sign that this is not evidence?",
  options: [
    "It uses two adjectives where one would do",
    "It names an effect rather than a device",
    "It would survive being pasted into an essay about a different passage",
    "It describes the author rather than the audience"
  ],
  answer: 2,
  why: "Where a passage is doing something with words, quote the word. ‘Rationalised', set against ‘closed', is a fact about this text that no other text shares.",
  whyNot: [
    "Adjective count is a style matter.",
    "It names neither an effect nor a device with any precision.",
    "It describes the writing, vaguely — the trouble is that the description fits anything."
  ]
},
{
  id: "qz-dv-diction-04",
  conceptId: "dv-diction",
  source: "Skill 7.A",
  stem: "Why is calling ‘A Modest Proposal' sarcastic a misreading?",
  options: [
    "Because sarcasm requires a spoken delivery",
    "Because its flat, reasonable register is exactly what makes it unbearable",
    "Because satire and irony are mutually exclusive categories",
    "Because the proposal is sincere at the literal level"
  ],
  answer: 1,
  why: "Sarcasm is irony with a target and an audible sneer; irony is broader and often cooler. Naming the sneer misses what the cookbook manner is doing.",
  whyNot: [
    "Sarcasm appears in writing readily.",
    "Satire routinely works through irony.",
    "The literal proposal is precisely what the reader cannot accept."
  ]
},

{
  id: "qz-dv-syntax-01",
  conceptId: "dv-syntax",
  source: "Skill 7.B",
  stem: "How do you distinguish a periodic sentence from a cumulative one?",
  options: [
    "By length: periodic sentences are longer",
    "By punctuation: periodic sentences use semicolons",
    "By subject matter: periodic sentences state conclusions",
    "By where the main clause sits: front is cumulative, end is periodic"
  ],
  answer: 3,
  why: "Length is irrelevant. A periodic sentence makes the reader absorb the conditions before there is a claim to resist; a cumulative one states the claim first and then refines it, reading like a mind noticing more as it goes.",
  whyNot: [
    "Either can be long or short.",
    "Punctuation does not define either.",
    "Both can state conclusions."
  ]
},
{
  id: "qz-dv-syntax-02",
  conceptId: "dv-syntax",
  source: "Skill 7.B",
  stem: "What does asyndeton do that polysyndeton does not?",
  options: [
    "It accelerates the list and leaves it open, as an extract from something longer",
    "It slows the list so each item is weighed separately",
    "It ranks the items so the last is the most important",
    "It converts a list into a comparison"
  ],
  answer: 0,
  why: "Removing the joints produces accumulation without closure. Polysyndeton adds a conjunction between every item, producing relentlessness or exhaustion instead.",
  whyNot: [
    "That is polysyndeton's effect.",
    "Neither device ranks its items; parallel structure asserts their equality.",
    "Neither makes a comparison."
  ]
},
{
  id: "qz-dv-syntax-03",
  conceptId: "dv-syntax",
  source: "Skill 7.B",
  stem: "What does a writer gain by juxtaposition that an assertion would not give them?",
  options: [
    "The claim is stated more memorably",
    "The claim is supported by two pieces of evidence at once",
    "The reader draws the conclusion, so it never has to be defended",
    "The claim is qualified without a modifier"
  ],
  answer: 2,
  why: "It arrives as the reader's own discovery — and because it was never asserted, the writer never has to defend it. The same logic makes a rhetorical question effective.",
  whyNot: [
    "Memorability is a side effect.",
    "Two items placed side by side are not two supports for a stated claim.",
    "No limit on scope has been added."
  ]
},
{
  id: "qz-dv-syntax-04",
  conceptId: "dv-syntax",
  source: "Skill 7.B",
  stem: "How do you test whether an element is parenthetical?",
  options: [
    "Check whether it is set off by dashes rather than commas",
    "Check whether it contains a subordinating conjunction",
    "Check whether it could open the sentence instead",
    "Delete it and see whether the sentence still says the same thing"
  ],
  answer: 3,
  why: "The CED describes parenthetical elements as not essential to understanding what they describe. A dash and a comma before the same clause are not equivalent: the dash announces the interruption and the comma smuggles it in.",
  whyNot: [
    "Either mark can set one off.",
    "Subordinators introduce dependent clauses, which may be essential.",
    "Movability is a different property."
  ]
},

{
  id: "qz-dv-comparison-01",
  conceptId: "dv-comparison",
  source: "Skill 8.A",
  stem: "What is the test that separates a metaphor from an analogy?",
  options: [
    "Length: an analogy runs for more than one sentence",
    "Ask ‘and what corresponds to the wheels?' — if the text answers, parts are mapping onto parts",
    "Whether the comparison uses ‘like' or ‘as'",
    "Whether the two things belong to the same category"
  ],
  answer: 1,
  why: "A metaphor asserts identity and stops. An analogy carries a conclusion across from a case the audience already accepts, and everything rests on the mapping — so good commentary says where the analogy stops holding.",
  whyNot: [
    "Length is not the test; a one-line analogy is possible.",
    "That distinguishes a simile from a metaphor.",
    "Comparisons are interesting precisely when the categories differ."
  ]
},
{
  id: "qz-dv-comparison-02",
  conceptId: "dv-comparison",
  source: "Skill 8.A",
  stem: "Why would a writer choose a simile over a metaphor?",
  options: [
    "Because ‘like' admits the two things are not the same",
    "Because similes are more vivid than metaphors",
    "Because similes require less shared knowledge",
    "Because similes are more formal in register"
  ],
  answer: 0,
  why: "That admission buys precision and leaves the reader room to reject part of the comparison. A metaphor offers no such room, which is its strength and its risk.",
  whyNot: [
    "Vividness varies independently of the form.",
    "Both require the audience to hold the second term.",
    "Neither is inherently more formal."
  ]
},
{
  id: "qz-dv-comparison-03",
  conceptId: "dv-comparison",
  source: "Skill 8.A",
  stem: "‘The budget went looking for the branch that could least afford it.' What has the figure imported?",
  options: [
    "A comparison between two named branches",
    "A qualification limiting the claim's scope",
    "Agency — once a process has intentions, it can be blamed",
    "An appeal to the audience's expertise in finance"
  ],
  answer: 2,
  why: "Personification is a kind of metaphor, and naming it precisely matters because of what it transfers. Nothing here was argued; the sentence simply hands a budget a motive.",
  whyNot: [
    "Only one branch is mentioned, and no two cases are set against each other.",
    "No limit on scope has been added.",
    "No expertise is invoked."
  ]
},
{
  id: "qz-dv-comparison-04",
  conceptId: "dv-comparison",
  source: "Skill 8.A",
  stem: "Why is a comparison unusually good material for the sophistication point?",
  options: [
    "Because Row C credits figurative language directly",
    "Because comparisons are rare enough to be worth remarking on",
    "Because unpacking one takes a whole paragraph",
    "Because it is simultaneously a stylistic choice and evidence about the audience"
  ],
  answer: 3,
  why: "A comparison only advances the purpose if the audience already holds the second term, so every comparison is a claim about who the audience is — and Question 2's Row C rewards explaining the significance of choices given the rhetorical situation.",
  whyNot: [
    "No route names figurative language.",
    "Comparisons are common.",
    "Length is not what earns the point."
  ]
},

{
  id: "qz-dv-repetition-01",
  conceptId: "dv-repetition",
  source: "Skill 5.B",
  stem: "How do anaphora and epistrophe differ in what they highlight?",
  options: [
    "Anaphora highlights what changes; epistrophe highlights what does not",
    "Anaphora highlights the subject; epistrophe highlights the verb",
    "Anaphora is used in speech; epistrophe in writing",
    "Anaphora requires three repetitions; epistrophe requires two"
  ],
  answer: 0,
  why: "The fixed opening becomes a beat the reader hears coming, so attention slides onto the words that vary. Repeating at the end makes the repeated phrase the fixed destination while the varying words do the arguing.",
  whyNot: [
    "Neither is tied to a part of speech.",
    "Both appear in both.",
    "No count is required for either."
  ]
},
{
  id: "qz-dv-repetition-02",
  conceptId: "dv-repetition",
  source: "Skill 5.B",
  stem: "What is the test for whether a repeated word is a device at all?",
  options: [
    "Whether it appears at least three times",
    "Whether a competent writer could easily have avoided the repetition",
    "Whether it appears in more than one paragraph",
    "Whether it is a content word rather than a function word"
  ],
  answer: 1,
  why: "Writers repeat terms because the subject requires them. If the repetition could have been avoided, it was chosen; if not, it is just the topic — and an essay that finds anaphora in an unavoidable subject noun has found nothing.",
  whyNot: [
    "Counting says nothing about whether the repetition was optional.",
    "Distribution is a separate observation about scale.",
    "Function words can be repeated deliberately, as in a tricolon of prepositions."
  ]
},
{
  id: "qz-dv-repetition-03",
  conceptId: "dv-repetition",
  source: "Skill 5.B",
  stem: "Why three, specifically, in a tricolon?",
  options: [
    "Because three is the maximum a reader can hold at once",
    "Because classical rhetoric prescribed the number",
    "Because three is the smallest number that reads as a pattern, and a group of three feels complete",
    "Because two items read as a contrast and four as a list"
  ],
  answer: 2,
  why: "So a tricolon makes a partial case sound exhaustive, and the reader stops wondering what a fourth item would have been.",
  whyNot: [
    "Readers hold longer lists perfectly well.",
    "Prescription is not the mechanism.",
    "Two items can be a pair rather than a contrast, and the completeness effect is the point."
  ]
},
{
  id: "qz-dv-repetition-04",
  conceptId: "dv-repetition",
  source: "Skill 5.B",
  stem: "‘The repetition emphasises the point.' Why does this earn nothing?",
  options: [
    "Because emphasis is not an effect the rubric recognises",
    "Because repetition more often produces monotony than emphasis",
    "Because the sentence lacks a quotation",
    "Because it is true of every instance of repetition ever written"
  ],
  answer: 3,
  why: "Say which point, say what the reader was made to expect, and say what the writer did with the expectation — extended it, broke it, or let it run until it became oppressive.",
  whyNot: [
    "Emphasis is a real effect; the trouble is that the claim distinguishes nothing.",
    "Monotony is one possible effect among several.",
    "A quotation would leave the same empty claim attached to it."
  ]
},

{
  id: "qz-dv-appeals-01",
  conceptId: "dv-appeals",
  source: "Skill 1.B",
  stem: "The same statistic can be logos or pathos. How do you tell which it is doing?",
  options: [
    "By whether the number is large enough to shock",
    "By whether it comes from a named source",
    "By whether it appears early or late in the passage",
    "By asking what the number is asked to do next"
  ],
  answer: 3,
  why: "If it licenses an inference — ‘which is why' — it is logos. If it is there to shock and never enters a chain of reasoning, it is pathos in a lab coat.",
  whyNot: [
    "Size is a property of the figure rather than of its function.",
    "Attribution bears on credibility rather than on which appeal is operating.",
    "Position does not decide the function."
  ]
},
{
  id: "qz-dv-appeals-02",
  conceptId: "dv-appeals",
  source: "Skill 1.B",
  stem: "How does ethos differ from an appeal to authority?",
  options: [
    "Ethos is the writer's own credibility; an appeal to authority borrows somebody else's",
    "Ethos is explicit; an appeal to authority is implied",
    "Ethos concerns character; an appeal to authority concerns evidence quality",
    "Ethos is a CED term; an appeal to authority is not"
  ],
  answer: 0,
  why: "They fail differently: a discredited expert damages that argument, while a discredited writer damages everything they have written. Worth separating in commentary for exactly that reason.",
  whyNot: [
    "Both can be either explicit or implied.",
    "Expert opinion is one type of evidence, which is a fact about the appeal rather than the distinction.",
    "Expert opinions are listed among evidence types in the framework."
  ]
},
{
  id: "qz-dv-appeals-03",
  conceptId: "dv-appeals",
  source: "Skill 1.B",
  stem: "Why is ethos partly a **consequence** of the other appeals rather than a parallel alternative?",
  options: [
    "Because credibility is established before a text begins",
    "Because conceding opposing arguments and selecting evidence well both build it",
    "Because the CED lists it first among the three",
    "Because emotional appeals always damage credibility"
  ],
  answer: 1,
  why: "Three sources feed it: the standing a writer arrives with, the standing they construct by what they disclose and concede, and the credibility their evidence lends them.",
  whyNot: [
    "Prior standing is only one of the three, and the one the text cannot change.",
    "Order in a list carries no weight.",
    "An emotional appeal can build credibility with an audience that shares the value."
  ]
},
{
  id: "qz-dv-appeals-04",
  conceptId: "dv-appeals",
  source: "Skill 1.B",
  stem: "Why is ‘the author uses ethos, pathos and logos to persuade the audience' the wrong sentence to write?",
  options: [
    "Because the three terms are not CED vocabulary",
    "Because appeals should be discussed one paragraph at a time",
    "Because it is true of almost every persuasive text ever written",
    "Because the audience should be named before the appeals"
  ],
  answer: 2,
  why: "If the sentence would survive being moved to an essay about a different passage, it is a label. The better version names the audience, the value and the specific move.",
  whyNot: [
    "The terms appear in the framework's guidance on argumentation.",
    "One paragraph per appeal is the structure imposed from the glossary.",
    "Naming the audience helps and would not rescue this sentence."
  ]
},

{
  id: "qz-dv-qualification-01",
  conceptId: "dv-qualification",
  source: "Skill 3.C",
  stem: "Why is an unqualified claim read as uninformed rather than confident?",
  options: [
    "Because absolute claims are harder to evidence",
    "Because readers distrust strong language on principle",
    "Because the rubric penalises absolute terms directly",
    "Because the absolute form advertises that the writer has not met the exceptions"
  ],
  answer: 3,
  why: "An argument is normally one turn in a discussion that was running before it and will run after, so an effective one tends not to state its claims in absolute terms. A lack of understanding of a subject's complexities produces oversimplification.",
  whyNot: [
    "Difficulty of evidencing is a consequence rather than the reason for the impression.",
    "Strong language is fine when the claim is bounded.",
    "No row names absolute terms as such."
  ]
},
{
  id: "qz-dv-qualification-02",
  conceptId: "dv-qualification",
  source: "Skill 3.C",
  stem: "What does hedging cost on this exam specifically?",
  options: [
    "Potentially Row A, since a vague position does not earn the thesis point",
    "Potentially Row B, since hedged claims cannot be evidenced",
    "Potentially Row C, since hedging is a listed failure",
    "Nothing directly — it is only a stylistic weakness"
  ],
  answer: 0,
  why: "The Question 1 and 3 rubrics list not taking a position, or a position that is vague or must be inferred, among responses that do not earn the point. A hedged thesis can forfeit it even when the essay beneath is sound.",
  whyNot: [
    "Hedged claims can be evidenced; they simply commit to little.",
    "Row C names hinting at other arguments rather than hedging.",
    "The cost is a whole point in a binary row."
  ]
},
{
  id: "qz-dv-qualification-03",
  conceptId: "dv-qualification",
  source: "Skill 3.C",
  stem: "Where exactly does the CED draw the line between rebutting and refuting?",
  options: [
    "Between addressing evidence and addressing the claim",
    "Between propose and demonstrate",
    "Between conceding partially and conceding wholly",
    "Between naming the opponent and leaving them anonymous"
  ],
  answer: 1,
  why: "Rebutting offers a contrasting perspective or alternative evidence to *propose* that a competing claim is invalid; refuting *demonstrates*, using evidence, that it is. The payoff is the same either way: writers enhance their credibility when they refute, rebut or concede.",
  whyNot: [
    "Both can address either.",
    "Degrees of concession are a separate distinction under conceding.",
    "Naming the holder is good practice rather than the definitional line."
  ]
},
{
  id: "qz-dv-qualification-04",
  conceptId: "dv-qualification",
  source: "Skill 3.C",
  stem: "In a Question 2 passage, why can the **absence** of a counterargument be worth writing about?",
  options: [
    "Because the rubric requires every passage to contain one",
    "Because an absence indicates the passage has been excerpted",
    "Because not all arguments address a counterargument, so declining to is a choice",
    "Because it shows the writer was unaware of the opposing view"
  ],
  answer: 2,
  why: "Asking why a writer declined to acknowledge an obvious objection — who the audience was, what raising it would have cost — is often more productive than cataloguing the objections they did raise.",
  whyNot: [
    "No such requirement exists.",
    "Excerpting is a separate matter and rarely removes a counterargument entirely.",
    "Assuming ignorance is a guess about the writer rather than a reading of the text."
  ]
}

];
