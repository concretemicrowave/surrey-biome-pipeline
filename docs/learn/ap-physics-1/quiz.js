/* AP Physics 1 — the end-of-lesson quiz bank.
   ===========================================================================

   One graded quiz per concept, four items each, served in full at the bottom of
   the lesson. This is the instrument that decides whether a concept reads
   solid, shaky or weak; the flashcards behind it keep what it finds.

   HOW AN ITEM IS BUILT, and why each field is compulsory:

     id          unique across the bank
     conceptId   the concept whose quiz it belongs to — never a second concept,
                 because a quiz is a measurement of one thing
     stem        the question, in the site's markdown-and-$math$ subset
     options     3–5 of them, one correct, all plausible to somebody who half
                 knows the topic. No "all of the above" and nothing that refers
                 to another option by its letter: the options are SHUFFLED on
                 every attempt, so position-dependent text is a wrong answer
                 waiting to happen
     answer      index into `options` AS AUTHORED
     why         why the right answer is right, written to be read by someone
                 who got it right as well as by someone who did not
     whyNot      one note per WRONG option, in authored order, skipping the
                 correct one — so a four-option item has exactly three. This is
                 the field to check twice; an off-by-one here hands every wrong
                 answer somebody else's explanation and reads as plausible
                 nonsense rather than as a bug
     source      the CED topic the item is grounded in

   Every item is ORIGINAL, written for this study site. None is a College Board
   question, and none is a paraphrase of one. Where a distractor encodes a
   specific error, that error is one the concept's own `trap` field names.

   The distractors are the content. An item whose three wrong options are
   obviously wrong measures nothing but reading speed; the ones here are built
   from the mistakes the lesson says people actually make, which is why getting
   one wrong tells you which sentence to reread.
   =========================================================================== */
"use strict";

var QUIZ = [

/* ---- Unit 1 · Kinematics ------------------------------------------------- */

{
  id: "qz-kin-scalars-vectors-01",
  conceptId: "kin-scalars-vectors",
  source: "CED 1.1",
  stem: "Which of these groups contains **only** vector quantities?",
  options: [
    "Displacement, velocity, acceleration",
    "Distance, speed, time",
    "Displacement, speed, acceleration",
    "Position, distance, velocity"
  ],
  answer: 0,
  why: "A vector needs a direction to be complete. Position, displacement, velocity and acceleration all do; distance and speed are finished by a magnitude alone, and so is time.",
  whyNot: [
    "All three are scalars, not vectors — this is the complete list of the quantities in Unit 1 that need no direction.",
    "Displacement and acceleration are vectors, but speed is the magnitude of velocity and carries no direction. Speed and velocity are the pair most often swapped.",
    "Position and velocity are vectors; distance is a path length, which has no direction to give."
  ]
},
{
  id: "qz-kin-scalars-vectors-02",
  conceptId: "kin-scalars-vectors",
  source: "CED 1.1",
  stem: "A student solving a one-dimensional problem reports a final answer of $-8$ m/s for the **speed** of a cart. What is wrong with that, if anything?",
  options: [
    "Nothing — the minus sign shows the cart is moving in the negative direction.",
    "Speed is the magnitude of velocity, so it cannot be negative",
    "The sign is only allowed once an origin has been chosen, and speeds are measured from no origin.",
    "It is wrong because speeds must be quoted with a direction in words, such as ‘8 m/s to the left’."
  ],
  answer: 1,
  why: "Speed is defined as the magnitude of velocity, and a magnitude is never negative. The number $-8$ m/s is a perfectly good *velocity component* along the chosen axis; it is the label that is wrong, not the arithmetic.",
  whyNot: [
    "A minus sign does carry direction — but only on a quantity that has one. Attaching it to speed asserts that speed has a direction, which is exactly the distinction the concept is about.",
    "An origin is needed to fix positions, not to make a sign meaningful for a velocity; what a signed velocity needs is a chosen positive direction, and that is available here.",
    "This gets the fix backwards. Adding a direction in words turns the quantity into a velocity described awkwardly — the point of the sign convention is that words cannot be substituted into an equation."
  ]
},
{
  id: "qz-kin-scalars-vectors-03",
  conceptId: "kin-scalars-vectors",
  source: "CED 1.1",
  stem: "Why does the provided equation sheet print $v_x = v_{x0} + a_x t$ rather than the arrow form $\\vec{v} = \\vec{v}_0 + \\vec{a}t$?",
  options: [
    "Because the arrow form is only valid in two dimensions, and AP Physics 1 kinematics is one-dimensional.",
    "Because components are easier to typeset than arrows, and the two forms say exactly the same thing.",
    "Because the sheet expects you to work one axis at a time",
    "Because the arrow form requires calculus, while the component form does not."
  ],
  answer: 2,
  why: "The subscript form is an instruction about method. Resolve the motion onto an axis, and from then on every quantity is a signed number whose sign is its direction — which is why the sheet never prints an arrow.",
  whyNot: [
    "The arrow form is valid in any number of dimensions, and this course does treat two-dimensional motion in Unit 1. Nothing about dimensionality makes the arrow illegal.",
    "They do not say the same thing: $\\vec{v}$ is a vector and $v_x$ is a signed number. Typesetting is not the reason, and treating the two as interchangeable is what produces unsigned substitutions.",
    "Neither form needs calculus. The three constant-acceleration equations are algebraic in both notations."
  ]
},
{
  id: "qz-kin-scalars-vectors-04",
  conceptId: "kin-scalars-vectors",
  source: "CED 1.1",
  stem: "Taking north as positive, a lift moves $+8$ m and then $-14$ m along a vertical shaft. Which statement is correct?",
  options: [
    "The vector sum is $-6$ m, and the total distance travelled is 22 m.",
    "The vector sum is $+22$ m, and the total distance travelled is 6 m.",
    "The vector sum is $-6$ m, and the total distance travelled is 6 m.",
    "The vector sum is $-22$ m, and the total distance travelled is 22 m."
  ],
  answer: 0,
  why: "In one dimension a vector sum is signed addition: $(+8) + (-14) = -6$ m, which is 6 m in the negative direction. Distance is path length, so it adds the magnitudes without regard to sign: $8 + 14 = 22$ m.",
  whyNot: [
    "This has the two quantities the wrong way round — 22 m is the path length and 6 m is the net change. The vector sum is the one that can be negative.",
    "The vector sum is right, but distance ignores direction and therefore cannot be smaller than it is here: the lift really did travel 22 m of shaft.",
    "Adding the magnitudes and then attaching a minus sign mixes the two operations. A distance of 22 m is correct; a vector sum of $-22$ m would require both legs to point the same way."
  ]
},

{
  id: "qz-kin-position-displacement-01",
  conceptId: "kin-position-displacement",
  source: "CED 1.2",
  stem: "A trolley starts at $x_0 = +2.0$ m, rolls forward to $+9.0$ m, then rolls back and stops at $+4.0$ m. What are its displacement and the distance it travelled?",
  options: [
    "Displacement $+7.0$ m, distance 12 m",
    "Displacement $+2.0$ m, distance 2.0 m",
    "Displacement $+12$ m, distance 12 m",
    "Displacement $+2.0$ m, distance 12 m"
  ],
  answer: 3,
  why: "Displacement is end minus start, $4.0 - 2.0 = +2.0$ m, and the detour leaves no trace in it. Distance adds the two legs as path lengths: 7.0 m out and 5.0 m back, so 12 m.",
  whyNot: [
    "$+7.0$ m is the displacement of the first leg only. The question asks about the whole trip, and the return leg subtracts from it.",
    "This treats the trip as though it never reversed. Distance equals $|\\Delta x|$ only when the object keeps going one way; here it turned round at $+9.0$ m.",
    "This reports the path length twice. Displacement and distance agree in magnitude only for motion with no reversal."
  ]
},
{
  id: "qz-kin-position-displacement-02",
  conceptId: "kin-position-displacement",
  source: "CED 1.2",
  stem: "You solve a problem, then repeat it with the origin moved 3.0 m in the positive direction. Which quantities change?",
  options: [
    "Positions change; displacements, velocities and accelerations do not.",
    "Nothing changes, because the origin is arbitrary.",
    "Positions and displacements change; velocities and accelerations do not.",
    "All four change, because every one of them is measured from the origin."
  ],
  answer: 0,
  why: "Every position shifts by the same 3.0 m, so the shift cancels in $\\Delta x = x - x_0$ and in everything built on it. That is the licence to put the origin wherever the arithmetic is cleanest.",
  whyNot: [
    "The values of $x$ genuinely do change — that is what moving an origin means. What survives is every quantity defined as a *difference* of positions.",
    "Displacement is a difference, so the constant shift subtracts out. If displacement changed with the origin, no two people could agree on how far anything moved.",
    "Velocity and acceleration are rates of change of position, and a constant added to every position contributes nothing to a change."
  ]
},
{
  id: "qz-kin-position-displacement-03",
  conceptId: "kin-position-displacement",
  source: "CED 1.2",
  stem: "Under what condition does the distance travelled equal the magnitude of the displacement?",
  options: [
    "Whenever the motion is in a straight line.",
    "Whenever the speed is constant.",
    "Whenever the object never reverses direction over the interval.",
    "Whenever the object returns to where it started."
  ],
  answer: 2,
  why: "A reversal is the only thing that makes the path longer than the net change in position. Split a journey at its turning points and each leg then satisfies the condition on its own — which is also the practical way to compute both quantities.",
  whyNot: [
    "A straight line is not enough: an object can run out along a line and back along the same line, covering path length while ending near where it started.",
    "Constant speed says nothing about direction. A ball bouncing between two walls at a steady speed piles up distance while its displacement stays small.",
    "This is the case where they differ most. A round trip has zero displacement and a distance equal to the whole path."
  ]
},
{
  id: "qz-kin-position-displacement-04",
  conceptId: "kin-position-displacement",
  source: "CED 1.2",
  stem: "What does the **object model** permit, and what does it discard?",
  options: [
    "It permits ignoring friction and air resistance, and discards any force that is not gravity.",
    "It permits treating a body as a point that still carries properties such as mass, and discards its size, shape and internal structure.",
    "It permits treating any object as having constant acceleration, and discards intervals in which the acceleration changes.",
    "It permits measuring position from any origin, and discards the distinction between position and displacement."
  ],
  answer: 1,
  why: "Collapsing a body to a point is what makes it legal to say a four-metre car is ‘at $x = 40$ m’. Mass and the other extensive properties come along; the geometry does not. Bodies whose internal structure matters are handled later by tracking the centre of mass.",
  whyNot: [
    "Neglecting friction or air resistance is a separate idealisation, stated problem by problem. The object model is about geometry, not about which forces are present.",
    "The constant-acceleration condition belongs to the kinematic equations, not to the object model. A point particle can accelerate non-uniformly.",
    "Choosing an origin is free, but it never blurs position into displacement — the two stay distinct precisely because one is a difference of the other."
  ]
},

{
  id: "qz-kin-average-velocity-01",
  conceptId: "kin-average-velocity",
  source: "CED 1.2",
  stem: "A runner completes one lap of a 400 m track in 80 s, finishing where she started. What are her average velocity and her average speed?",
  options: [
    "Average velocity 5.0 m/s, average speed 5.0 m/s",
    "Average velocity 0, average speed 0",
    "Average velocity 0, average speed 5.0 m/s",
    "Neither can be found without knowing the shape of the track."
  ],
  answer: 2,
  why: "Average velocity is displacement over time, and the displacement of a closed lap is exactly zero. Average speed uses path length instead: $400 / 80 = 5.0$ m/s. The two differ because their numerators are different quantities.",
  whyNot: [
    "5.0 m/s is the average speed. Reporting it as the velocity as well ignores the fact that she finished where she began.",
    "The average speed cannot be zero: she covered 400 m of track. Only the *velocity* is killed by returning to the start.",
    "The shape is irrelevant to both. Displacement depends only on the endpoints, and the path length was given."
  ]
},
{
  id: "qz-kin-average-velocity-02",
  conceptId: "kin-average-velocity",
  source: "CED 1.2",
  stem: "When is $v_{avg} = \\frac{v_0 + v}{2}$ legitimate?",
  options: [
    "For any motion whatever — it is the definition of an average.",
    "Only when the object starts from rest.",
    "Only when the velocity never changes sign.",
    "Only when the acceleration is constant over the interval."
  ],
  answer: 3,
  why: "Under constant acceleration the velocity–time graph is a straight line, and the average height of a straight line is its midpoint value. Bend the graph and the midpoint of the endpoints stops being the mean height, so the rule fails.",
  whyNot: [
    "The definition of average velocity is displacement over time. This midpoint rule is a *consequence* that needs constant acceleration, which is why applying it to a two-stage trip at different steady speeds gives the wrong answer unless the stages happen to take equal times.",
    "Starting from rest is neither necessary nor sufficient — the rule works for a launch at any initial speed under constant acceleration, and fails from rest if the acceleration varies.",
    "A sign change is harmless: a ball thrown up and caught has constant acceleration throughout, and the rule holds across the reversal."
  ]
},
{
  id: "qz-kin-average-velocity-03",
  conceptId: "kin-average-velocity",
  source: "CED 1.2",
  stem: "A car covers the first 20 km of a trip at 40 km/h and the next 20 km at 120 km/h. What is its average speed for the whole trip?",
  options: [
    "80 km/h",
    "60 km/h",
    "70 km/h",
    "It cannot be determined without knowing how long each stage lasted."
  ],
  answer: 1,
  why: "Total distance over total time. The stages take $0.5$ h and $\\frac{1}{6}$ h, so 40 km takes $\\frac{2}{3}$ h and the average is $40 \\div \\frac{2}{3} = 60$ km/h. Equal *distances* are not equal *times*, and the slow stage occupies three quarters of the trip.",
  whyNot: [
    "80 km/h is the mean of the two speeds, which weights each stage equally. Averaging weights by time, and the car spent three times as long going slowly.",
    "70 km/h looks like a compromise between the mean and the correct value but corresponds to no defined operation on these numbers.",
    "The stage durations follow from the distances and the speeds — $t = d/v$ — so nothing further is needed."
  ]
},
{
  id: "qz-kin-average-velocity-04",
  conceptId: "kin-average-velocity",
  source: "CED 1.2",
  stem: "How does instantaneous velocity relate to average velocity, in the terms this course uses?",
  options: [
    "It is a different quantity, defined by a derivative rather than by a ratio.",
    "It is the average velocity over the whole journey, evaluated at one instant.",
    "It is what the average velocity approaches as the interval around that instant is made shorter and shorter.",
    "It is the average of the highest and lowest velocities reached."
  ],
  answer: 2,
  why: "The two are the same construction at different interval lengths. Shrink the interval until the motion has no time to change during it and the average over that interval *is* the instantaneous value — graphically, a short enough chord lies along the tangent.",
  whyNot: [
    "That is the calculus statement of the same idea, but this course is explicit that the limit is not taken formally: it treats the very-short-interval average and the instantaneous value as the same measurement.",
    "An average over the whole journey has one value for the journey; it cannot be ‘evaluated at an instant’, and it is generally not equal to the velocity at any particular moment.",
    "Extremes say nothing about the middle. A car that touches 0 and 30 m/s has no guaranteed instantaneous velocity of 15 m/s at the moment you care about."
  ]
},

{
  id: "qz-kin-acceleration-01",
  conceptId: "kin-acceleration",
  source: "CED 1.2",
  stem: "A cart moves along the $x$ axis with constant acceleration $a_x = +2.0$ m/s$^2$. At one instant $v_x = -6.0$ m/s. What happens next?",
  options: [
    "It speeds up, because the acceleration is positive.",
    "It slows, and is momentarily at rest 3.0 s later.",
    "It slows, and is momentarily at rest 12 s later.",
    "It moves at constant speed, because the acceleration is constant."
  ],
  answer: 1,
  why: "Velocity and acceleration have opposite signs, so the acceleration opposes the motion and the speed falls. From $v_x = v_{x0} + a_x t$: $0 = -6.0 + 2.0t$, so $t = 3.0$ s.",
  whyNot: [
    "A positive acceleration speeds an object up only if it is already moving in the positive direction. What matters is whether the two signs agree, not what either sign is on its own.",
    "12 s comes from dividing by the wrong quantity — $6.0 \\times 2.0$ rather than $6.0 \\div 2.0$. A units check catches it: m/s divided by m/s$^2$ gives seconds.",
    "Constant acceleration means the velocity changes at a steady *rate*, not that it fails to change. Constant speed would require zero acceleration."
  ]
},
{
  id: "qz-kin-acceleration-02",
  conceptId: "kin-acceleration",
  source: "CED 1.2",
  stem: "Which single statement decides whether an object is speeding up or slowing down?",
  options: [
    "Whether the acceleration is positive or negative.",
    "Whether the velocity is positive or negative.",
    "Whether the velocity and the acceleration have the same sign.",
    "Whether the acceleration is increasing or decreasing in magnitude."
  ],
  answer: 2,
  why: "Same signs means the acceleration is pushing the way the object is already going, so the speed grows; opposite signs means it opposes the motion and the speed falls. Either sign alone tells you nothing, because both are measured from an axis you chose.",
  whyNot: [
    "A negative acceleration slows a rightward-moving object and speeds up a leftward-moving one. The sign is a statement about direction, not about getting faster.",
    "The sign of the velocity says which way the object is going, and an object can be gaining or losing speed while moving either way.",
    "How the acceleration itself changes is a further question. An object with a constant acceleration is already speeding up or slowing down."
  ]
},
{
  id: "qz-kin-acceleration-03",
  conceptId: "kin-acceleration",
  source: "CED 1.2",
  stem: "A ball is thrown straight up. On the way up, while it is slowing, what is the direction of its acceleration?",
  options: [
    "Upwards while it rises, then downwards once it starts to fall.",
    "Zero while it rises at a steady rate of slowing, then downwards.",
    "Upwards the whole time, since something must be holding it up.",
    "Downwards the whole time, including while it is rising."
  ],
  answer: 3,
  why: "Only gravity acts, so the acceleration is $g$ downwards for the entire flight. Rising and falling are not two phases with two accelerations; they are one motion in which the velocity happens to change sign in the middle.",
  whyNot: [
    "This is the intuition that acceleration points the way the object is moving. It does not: on the way up the acceleration opposes the velocity, which is precisely why the ball slows.",
    "‘A steady rate of slowing’ *is* a non-zero acceleration. Zero acceleration would mean the ball rose forever at its launch speed.",
    "Nothing is holding it up — that is the point of free fall. The ball rises because it was given an upward velocity, not because an upward force persists."
  ]
},
{
  id: "qz-kin-acceleration-04",
  conceptId: "kin-acceleration",
  source: "CED 1.2",
  stem: "A car's velocity goes from $+25$ m/s to $+10$ m/s in 5.0 s. What is its average acceleration?",
  options: [
    "$-3.0$ m/s$^2$",
    "$+3.0$ m/s$^2$",
    "$-7.0$ m/s$^2$",
    "$+7.0$ m/s$^2$"
  ],
  answer: 0,
  why: "$a_{avg} = \\frac{\\Delta v}{\\Delta t} = \\frac{10 - 25}{5.0} = -3.0$ m/s$^2$. The sign is not decoration: it says the acceleration points the opposite way to the motion, which is what slowing down means on this axis.",
  whyNot: [
    "The magnitude is right and the sign has been dropped, which is the single most common error in this topic. A positive value here would mean the car was gaining speed.",
    "7.0 comes from $\\frac{25 + 10}{5.0}$ — adding the velocities instead of subtracting them. Acceleration is built on a *change*.",
    "Both the operation and the sign are wrong here: the velocities have been added rather than subtracted, and the result labelled as an increase."
  ]
},

{
  id: "qz-kin-graphs-slope-01",
  conceptId: "kin-graphs-slope",
  source: "CED 1.3",
  stem: "A position–time graph reaches a maximum and turns over. What is happening at that peak?",
  options: [
    "The object is at its fastest, since it is at its highest point on the graph.",
    "The object is instantaneously at rest, and its acceleration need not be zero.",
    "The object is at rest and stays at rest, since the graph has stopped rising.",
    "Both the velocity and the acceleration are zero there."
  ],
  answer: 1,
  why: "At a maximum the tangent is horizontal, so the slope — the velocity — is zero. The acceleration is the slope of a *different* graph, and at the top of a throw it is $g$ downwards, which is exactly why the object does not stay there.",
  whyNot: [
    "Height on a position–time graph is position, not speed. A horizontal line high on the graph is an object that is far away and completely stationary.",
    "The graph turns *over*, so the object moves away in the other direction immediately. Staying at rest would show as a horizontal segment, not a peak.",
    "Zero velocity and zero acceleration are separate features on separate graphs. Reading one off the other is the standard trap here."
  ]
},
{
  id: "qz-kin-graphs-slope-02",
  conceptId: "kin-graphs-slope",
  source: "CED 1.3",
  stem: "A graph shows a horizontal straight line. What can you conclude?",
  options: [
    "The object is stationary.",
    "The object has zero acceleration.",
    "Nothing, until you read the vertical axis label.",
    "The object is moving at constant velocity."
  ],
  answer: 2,
  why: "Horizontal means ‘this quantity is not changing’, and which quantity that is depends entirely on the axis. On $x$–$t$ it means stationary; on $v$–$t$ it means constant velocity; on $a$–$t$ it means constant acceleration. The shape alone says nothing.",
  whyNot: [
    "True only on a position–time graph. On a velocity–time graph the same shape means the object is moving steadily, which is nearly the opposite claim.",
    "True on a velocity–time graph, and false on a position–time graph — where a horizontal line means the object is stationary and its acceleration is zero for a different reason.",
    "True only on a velocity–time graph. On a position–time graph a horizontal line is an object going nowhere."
  ]
},
{
  id: "qz-kin-graphs-slope-03",
  conceptId: "kin-graphs-slope",
  source: "CED 1.3",
  stem: "On a curved position–time graph, what is the difference between the slope of a chord and the slope of a tangent?",
  options: [
    "The chord gives the average velocity between its endpoints; the tangent gives the instantaneous velocity at its point of contact.",
    "The chord gives the acceleration; the tangent gives the velocity.",
    "The chord gives the displacement; the tangent gives the velocity.",
    "They differ only in accuracy — both estimate the same instantaneous velocity, and the tangent is the better estimate."
  ],
  answer: 0,
  why: "Rise over run between two points is $\\frac{\\Delta x}{\\Delta t}$, which is the definition of average velocity over that interval. Shrink the interval and the chord approaches the tangent, which is why a short-enough average and the instantaneous value are treated as the same measurement.",
  whyNot: [
    "Acceleration is the slope of a velocity–time graph. No slope on a position–time graph is an acceleration.",
    "Displacement is read as an *area*, and on a velocity–time graph rather than this one. Slopes and areas run in opposite directions along the chain.",
    "They are different quantities, not two attempts at one. A chord over a long interval is an exactly correct average velocity — it is not an inaccurate instantaneous velocity."
  ]
},
{
  id: "qz-kin-graphs-slope-04",
  conceptId: "kin-graphs-slope",
  source: "CED 1.3",
  stem: "A cart's position–time graph rises in a straight line from $+4.0$ m at $t = 0$ to $+10.0$ m at $t = 3.0$ s, is flat until $t = 5.0$ s, then falls in a straight line to $-2.0$ m at $t = 8.0$ s. Which describes the velocity–time graph?",
  options: [
    "A straight line falling steadily from $+2.0$ m/s to $-4.0$ m/s.",
    "Three horizontal steps, at $+2.0$ m/s, $0$ and $-4.0$ m/s.",
    "Three horizontal steps, at $+2.0$ m/s, $0$ and $+4.0$ m/s.",
    "A curve, because the position graph changes slope twice."
  ],
  answer: 1,
  why: "Each straight segment has one slope, so each becomes one horizontal velocity segment: $6.0/3.0 = +2.0$ m/s, then zero, then $-12.0/3.0 = -4.0$ m/s.",
  whyNot: [
    "A steadily falling velocity graph would mean constant non-zero acceleration, which would show as a curve on the position graph. Straight segments mean constant velocity within each segment.",
    "The third segment falls from $+10.0$ m to $-2.0$ m, so the position is decreasing and the velocity is negative. Taking the magnitude here throws away the reversal.",
    "A change in slope at a corner is not a curve. Between the corners the slope is constant, and it is the slope that the velocity graph plots."
  ]
},

{
  id: "qz-kin-graphs-area-01",
  conceptId: "kin-graphs-area",
  source: "CED 1.3",
  stem: "A cart's velocity is $+6.0$ m/s from $t = 0$ to $t = 4.0$ s, then falls along a straight line to $-2.0$ m/s at $t = 8.0$ s. What are its displacement and the distance it travelled?",
  options: [
    "Displacement $+34$ m, distance $+34$ m",
    "Displacement $+32$ m, distance 34 m",
    "Displacement $+24$ m, distance 32 m",
    "Displacement $+32$ m, distance 32 m"
  ],
  answer: 1,
  why: "The rectangle gives $+24$ m. The ramp crosses zero at $t = 7.0$ s, giving a triangle of $+9.0$ m above the axis and $-1.0$ m below it. Signed sum: $+32$ m. Magnitudes: $24 + 9 + 1 = 34$ m.",
  whyNot: [
    "34 m is the distance. Using it as the displacement counts the backwards travel as forwards, so the two answers differ by twice that travel — never a small error.",
    "$+24$ m is the rectangle alone, with the whole ramp left out.",
    "Displacement is right, but the distance must exceed it whenever any part of the graph is below the axis, because that stretch adds path length while subtracting position."
  ]
},
{
  id: "qz-kin-graphs-area-02",
  conceptId: "kin-graphs-area",
  source: "CED 1.3",
  stem: "A question gives a velocity–time graph and asks **where the cart is** at $t = 6$ s. What does the area under the graph give you?",
  options: [
    "The position at $t = 6$ s directly.",
    "The distance travelled, which is the position only if the cart started at the origin.",
    "The average velocity over the interval, which must then be multiplied by the time.",
    "The change in position, which must be added to the starting position."
  ],
  answer: 3,
  why: "An area under a velocity graph is $\\Delta x$, not $x$. To answer ‘where is it’ you need $x = x_0 + (\\text{signed area})$ — which is why the question is testing whether you noticed that it asked for a position rather than a displacement.",
  whyNot: [
    "Only if the cart happened to start at $x_0 = 0$ and never reversed. The graph cannot tell you where the motion began; that has to come from the problem.",
    "The signed area is the displacement; taking magnitudes gives distance. And even a distance is not a position unless the cart started at the origin and never turned round.",
    "The area already carries the time in it — height times width is m/s times s, which is metres. Multiplying by time again would give the wrong units."
  ]
},
{
  id: "qz-kin-graphs-area-03",
  conceptId: "kin-graphs-area",
  source: "CED 1.3",
  stem: "What does the area under an **acceleration**–time graph represent?",
  options: [
    "The velocity at the end of the interval.",
    "The change in velocity over the interval.",
    "The displacement over the interval.",
    "The average acceleration over the interval."
  ],
  answer: 1,
  why: "Areas run one step back up the chain each time, and the units confirm it: m/s$^2$ multiplied by s gives m/s. To get a final velocity you must add the change to the initial one.",
  whyNot: [
    "That would need the initial velocity as well. The area is a change, exactly as the area under a velocity graph is a change in position.",
    "Displacement is the area under a *velocity* graph. Getting displacement from an acceleration graph would take two steps, not one.",
    "The average acceleration is the area divided by the elapsed time, not the area itself."
  ]
},
{
  id: "qz-kin-graphs-area-04",
  conceptId: "kin-graphs-area",
  source: "CED 1.3",
  stem: "For finding displacement from a velocity–time graph, when is ‘average the first and last velocities, then multiply by the elapsed time’ a valid shortcut?",
  options: [
    "Always — it is the definition of average velocity.",
    "Only when the graph is a single straight line over the whole interval.",
    "Only when the graph stays above the horizontal axis.",
    "Never — displacement always requires decomposing into rectangles and triangles."
  ],
  answer: 1,
  why: "For a single straight line the region is a trapezium, and a trapezium's area really is its mean height times its width. Join a rectangle to a ramp and the mean of the two endpoints stops describing the whole region.",
  whyNot: [
    "Average velocity is displacement over time, and that ratio is always valid; the *midpoint* formula being used here is not, because it assumes a straight velocity graph.",
    "Sign is not the issue. A single straight line that crosses the axis still works, because the trapezium area handles the negative part correctly; two segments with different slopes fail whether or not they cross.",
    "The shortcut is genuinely correct for one straight line, and that case is common enough to be worth recognising."
  ]
},

{
  id: "qz-kin-constant-a-equations-01",
  conceptId: "kin-constant-a-equations",
  source: "CED 1.3",
  stem: "You know $v_0$, $a$ and $\\Delta x$, and you want the final velocity $v$. Which equation should you reach for, and why?",
  options: [
    "$x = x_0 + v_{x0}t + \\frac{1}{2}a_x t^2$, because it contains the displacement.",
    "$v_x = v_{x0} + a_x t$, because it is the simplest.",
    "$v_x^2 = v_{x0}^2 + 2a_x(x - x_0)$, because it is the one missing the time.",
    "Any of the three, since all are valid whenever the acceleration is constant."
  ],
  answer: 2,
  why: "Each of the three is missing exactly one of the five quantities. Time is what you neither know nor want here, so the equation without time in it is the one that answers the question in a single step.",
  whyNot: [
    "It contains the displacement, but also the time — which you do not have. You would have to solve for $t$ first, turning one step into two.",
    "It is the simplest and it contains $t$, which is unknown. Simplicity is not the selection rule; which quantity is *absent* is.",
    "All three are valid, but two of them contain a quantity you neither know nor want, so choosing badly costs an extra unknown and an extra chance to slip."
  ]
},
{
  id: "qz-kin-constant-a-equations-02",
  conceptId: "kin-constant-a-equations",
  source: "CED 1.3",
  stem: "A coffee filter is dropped and falls with noticeable air resistance, so its acceleration decreases as it speeds up. A student uses $v^2 = v_0^2 + 2a\\Delta x$ with $a = g$ to find its landing speed. What is the status of that answer?",
  options: [
    "Wrong, because the equation requires constant acceleration and this acceleration is not constant.",
    "Approximately right, since air resistance only reduces the answer by a few per cent.",
    "Right, provided $g$ is replaced by the average of the initial and final accelerations.",
    "Right, because the equation contains no time and so is unaffected by how the acceleration varies."
  ],
  answer: 0,
  why: "The constant-acceleration condition is not decoration. When it fails all three equations are simply wrong, with no correction factor available — and this course is explicit that non-uniform acceleration is described and reasoned about qualitatively rather than computed.",
  whyNot: [
    "The size of the error is not the issue, and for a filter it is not small: the whole point of the example is that drag dominates almost immediately.",
    "There is no such rule. Averaging the endpoints of an acceleration works no better here than averaging velocities does on a curved velocity graph.",
    "Eliminating $t$ does not weaken the assumption. The third equation is derived from the other two, so it inherits the constant-acceleration condition intact."
  ]
},
{
  id: "qz-kin-constant-a-equations-03",
  conceptId: "kin-constant-a-equations",
  source: "CED 1.3",
  stem: "A go-kart starts from rest and accelerates uniformly at 2.0 m/s$^2$. How fast is it moving after it has covered 36 m?",
  options: [
    "6.0 m/s",
    "12 m/s",
    "72 m/s",
    "18 m/s"
  ],
  answer: 1,
  why: "$v^2 = 0 + 2(2.0)(36) = 144$, so $v = 12$ m/s. No time is given or wanted, which is exactly the signature of the third equation.",
  whyNot: [
    "6.0 m/s is $\\sqrt{2 \\times 36 / 2}$ or a similar mis-grouping; substituting it back gives $v^2 = 36$, not 144.",
    "72 m/s is $2 \\times 36$ — the product $2a\\Delta x$ before taking the square root, and before the factor of $a$ was applied correctly.",
    "18 m/s does not satisfy the equation: $18^2 = 324$, well over $2a\\Delta x = 144$."
  ]
},
{
  id: "qz-kin-constant-a-equations-04",
  conceptId: "kin-constant-a-equations",
  source: "CED 1.3",
  stem: "An object starts from rest under constant acceleration. If it covers a distance $d$ in the first second, how far does it travel in total in the first two seconds?",
  options: [
    "$2d$",
    "$3d$",
    "$4d$",
    "$\\sqrt{2}\\,d$"
  ],
  answer: 2,
  why: "From rest, $x = \\frac{1}{2}at^2$, so the distance grows as $t^2$. Doubling the time quadruples the total distance — which also means the second second alone accounts for $3d$ of it.",
  whyNot: [
    "$2d$ would be right for constant *velocity*, where distance grows in proportion to time. Under acceleration the object is faster in the second second than in the first.",
    "$3d$ is the distance covered *during* the second second, not the total from the start. It is the difference $4d - d$.",
    "The square root inverts the relationship: time appears squared in the position equation, so distance grows faster than time, not more slowly."
  ]
},

{
  id: "qz-kin-free-fall-01",
  conceptId: "kin-free-fall",
  source: "CED 1.3",
  stem: "A ball is thrown vertically upwards with negligible air resistance. At the highest point of its flight, which statement is correct?",
  options: [
    "Its velocity and its acceleration are both zero.",
    "Its velocity is zero and its acceleration is about 10 m/s$^2$ downwards.",
    "Its velocity is zero and its acceleration is about 10 m/s$^2$ upwards.",
    "Its velocity is about 10 m/s downwards and its acceleration is zero."
  ],
  answer: 1,
  why: "Only gravity acts, so the acceleration is constant at about 10 m/s$^2$ downwards for the whole flight, including that instant. The velocity passes through zero because the ball is reversing — and a quantity passing through zero can still be changing fast.",
  whyNot: [
    "This treats zero velocity as implying zero acceleration. If it did, the ball would park at the top instead of falling back.",
    "The magnitude is right and the direction reversed, usually by reasoning that the ball is about to move downwards so the acceleration must have ‘turned round’. It never turned round; it pointed down throughout.",
    "This attaches the value of $g$ to the wrong quantity. At the top it is the velocity that is zero, not the acceleration."
  ]
},
{
  id: "qz-kin-free-fall-02",
  conceptId: "kin-free-fall",
  source: "CED 1.3",
  stem: "A ball is thrown straight up at 15 m/s and caught at the same height it left. Taking $g \\approx 10$ m/s$^2$, how long is it in the air, and how fast is it moving when caught?",
  options: [
    "1.5 s, caught at 15 m/s",
    "3.0 s, caught at 30 m/s",
    "1.5 s, caught at 7.5 m/s",
    "3.0 s, caught at 15 m/s"
  ],
  answer: 3,
  why: "Time to the top is $v_{y0}/g = 1.5$ s, and a flight between two points at the same height is symmetric, so the whole trip is 3.0 s and the ball returns with the speed it left with, downwards.",
  whyNot: [
    "1.5 s is the time to the highest point only. The symmetry that fixes the landing speed also doubles the time.",
    "Symmetry gives equal speeds, not doubled ones. A landing at 30 m/s would require twice the energy the throw put in.",
    "Both halves are wrong: 1.5 s is only the rise, and the ball cannot return more slowly than it left when the two heights match."
  ]
},
{
  id: "qz-kin-free-fall-03",
  conceptId: "kin-free-fall",
  source: "CED 1.3",
  stem: "A ball is thrown straight up from the edge of a ledge and lands on the ground well below the launch point. Which claim is **not** justified?",
  options: [
    "Its acceleration is $g$ downwards for the whole flight.",
    "It is momentarily at rest at the top of its path.",
    "It spends as long falling as it did rising.",
    "It is moving faster when it lands than when it was thrown."
  ],
  answer: 2,
  why: "The up-and-down symmetry holds only between two points at the *same* height. Landing below the launch point adds fall time and adds speed, so the descent takes longer than the rise.",
  whyNot: [
    "This is true and is the point of the concept: one acceleration for one motion, whichever way the ball is moving.",
    "True — the vertical velocity passes through zero at the top of any vertical throw, whatever the landing height.",
    "True here: the ball falls further than it rose, so it arrives with more speed than it left with."
  ]
},
{
  id: "qz-kin-free-fall-04",
  conceptId: "kin-free-fall",
  source: "CED 1.3",
  stem: "Which value of $g$ does this course use, and where does each version come from?",
  options: [
    "9.8 m/s$^2$ in all cases; the approximation $10$ is never accepted.",
    "$10$ m/s$^2$ for numerical work, and $9.8$ m/s$^2$ on the equation sheet",
    "$10$ m/s$^2$ on the equation sheet, with 9.8 reserved for laboratory work.",
    "Whichever value makes the arithmetic cleanest, since $g$ varies with location anyway."
  ],
  answer: 1,
  why: "The CED says a value of about 10 m/s$^2$ will be used wherever a number is needed, and the provided sheet prints the more precise 9.8 m/s$^2$. Questions are built around 10, and correct work with 9.8 or 9.81 is not marked down.",
  whyNot: [
    "The approximation is not merely accepted — it is what the questions are constructed around, which is why so many of them come out to clean numbers.",
    "This reverses the two: 9.8 m/s$^2$ is what the sheet prints.",
    "$g$ does vary slightly with location, but that is not a licence to choose a value; the exam's convention is stated, not left open."
  ]
},

{
  id: "qz-kin-reference-frames-01",
  conceptId: "kin-reference-frames",
  source: "CED 1.4",
  stem: "On a straight road, car A travels north at 25 m/s and car B travels north at 15 m/s. Taking north as positive, what is the velocity of A as measured by the driver of B?",
  options: [
    "$+40$ m/s",
    "$-10$ m/s",
    "$+25$ m/s, since B's own motion does not affect what A is doing",
    "$+10$ m/s"
  ],
  answer: 3,
  why: "Put both velocities in the ground frame with one axis and subtract the observer's: $v_{AB} = v_{Ag} - v_{Bg} = 25 - 15 = +10$ m/s. A pulls away northwards at 10 m/s as seen from B.",
  whyNot: [
    "Adding is the standard error for two objects moving the same way. It would describe cars approaching head-on, not one slowly overtaking the other.",
    "This is $v_{BA}$ — the velocity of B as seen from A. Reversing the pair flips the sign, so the order of the subscripts matters.",
    "What A does is unaffected by B, but what B *measures* is not. That is what changing reference frame means."
  ]
},
{
  id: "qz-kin-reference-frames-02",
  conceptId: "kin-reference-frames",
  source: "CED 1.4",
  stem: "An experiment is performed on a train moving at a constant 30 m/s past a platform. Which quantity do the observer on the train and the observer on the platform agree about?",
  options: [
    "The position of the object.",
    "The velocity of the object.",
    "The acceleration of the object.",
    "None of these, since all three are measured relative to the observer."
  ],
  answer: 2,
  why: "The two frames disagree by a constant velocity, and a constant contributes nothing to a rate of change. The two velocity–time graphs are vertical shifts of each other and so have identical slopes — which is why $\\vec{F}_{net} = m\\vec{a}$ gives both observers the same forces.",
  whyNot: [
    "Positions differ by a steadily growing amount, since the frames are separating.",
    "Velocities differ by exactly 30 m/s — that is the definition of the frames' relative motion.",
    "Acceleration genuinely is agreed on between inertial frames, and that invariance is what makes the laws of motion frame-independent."
  ]
},
{
  id: "qz-kin-reference-frames-03",
  conceptId: "kin-reference-frames",
  source: "CED 1.4",
  stem: "Two cars approach each other head-on, one at 20 m/s east and one at 12 m/s west. Taking east as positive, what is the velocity of the second car as measured from the first?",
  options: [
    "$-32$ m/s",
    "$-8$ m/s",
    "$+8$ m/s",
    "$+32$ m/s"
  ],
  answer: 0,
  why: "Sign every velocity from the axis first: $v_{1g} = +20$, $v_{2g} = -12$. Then $v_{21} = v_{2g} - v_{1g} = -12 - 20 = -32$ m/s — the second car closes at 32 m/s in the negative direction. The subtraction produces a large answer here precisely because one velocity was negative.",
  whyNot: [
    "$-8$ m/s comes from subtracting the *speeds* rather than the signed velocities, which is the rule for two objects moving the same way.",
    "$+8$ m/s has both errors: unsigned speeds, and the wrong sign for the result.",
    "$+32$ m/s has the right magnitude and the wrong direction — this is $v_{12}$, the velocity of the first car as seen from the second."
  ]
},
{
  id: "qz-kin-reference-frames-04",
  conceptId: "kin-reference-frames",
  source: "CED 1.4",
  stem: "Why is ‘sign every velocity from one axis, then subtract the observer's’ a better working rule than ‘same direction means subtract, opposite means add’?",
  options: [
    "Because the second rule is wrong: relative velocities always add.",
    "Because the first rule also works when the velocities are at an angle, which AP Physics 1 requires.",
    "Because the first rule is a single operation performed the same way every time",
    "Because subtraction is a faster arithmetic operation than addition."
  ],
  answer: 2,
  why: "The signs do the case analysis for you. Two objects going the same way subtract to a small relative velocity and two going opposite ways subtract to a large one — but you never have to decide which case you are in, because the operation does not change.",
  whyNot: [
    "The direction rule is not simply inverted; it is right in each case and easy to apply backwards, which is worse than being reliably wrong.",
    "The component method does generalise, but this course restricts relative velocity to one dimension, so that is not the reason to prefer it here.",
    "Speed of arithmetic has nothing to do with it, and the two operations cost the same anyway."
  ]
},

{
  id: "qz-kin-vector-components-01",
  conceptId: "kin-vector-components",
  source: "CED 1.5",
  stem: "A ball leaves a launcher at 25 m/s, 37° above the horizontal. What are the components of its initial velocity?",
  options: [
    "$v_{0x} = 15$ m/s, $v_{0y} = 20$ m/s",
    "$v_{0x} = 20$ m/s, $v_{0y} = 15$ m/s",
    "$v_{0x} = 12.5$ m/s, $v_{0y} = 21.7$ m/s",
    "$v_{0x} = 25$ m/s, $v_{0y} = 25 \\sin 37°$ m/s"
  ],
  answer: 1,
  why: "The angle is measured from the horizontal, so the horizontal component is next to it and takes cosine: $25 \\times \\frac{4}{5} = 20$ m/s. The vertical is across from it and takes sine: $25 \\times \\frac{3}{5} = 15$ m/s. Check: $\\sqrt{20^2 + 15^2} = 25$.",
  whyNot: [
    "Sine and cosine have been swapped. The check catches it: this pair recombines to 25 m/s as well, but a 37° launch cannot have a vertical component larger than its horizontal one.",
    "These are the components for a 60° launch. The 37–53 pair in the trig table exists to give the exact 3–4–5 triangle, so an exam using 37° is signalling clean arithmetic.",
    "The horizontal component of a vector cannot equal the vector's own magnitude unless the angle is zero — and no component may exceed the magnitude it came from."
  ]
},
{
  id: "qz-kin-vector-components-02",
  conceptId: "kin-vector-components",
  source: "CED 1.5",
  stem: "A rope pulls a crate with a force quoted as 200 N at 30° **from the vertical**. Which component takes the cosine?",
  options: [
    "The horizontal component, because horizontal components always take cosine.",
    "Neither — with the angle quoted from the vertical you must convert to 60° first.",
    "Both, since the two components are equal when the angle is measured from an axis.",
    "The vertical component, because it is the one adjacent to the quoted angle."
  ],
  answer: 3,
  why: "Cosine goes with the component *next to* the angle, whatever axis the angle was quoted from. Here that is the vertical one: $F_y = 200\\cos 30°$, $F_x = 200\\sin 30°$. Draw the triangle and read it off rather than remembering a pairing.",
  whyNot: [
    "‘Horizontal is always cosine’ works until an exam quotes the angle from the vertical — a ramp, a hanging string, a launch from the upright — and then it is exactly backwards.",
    "Converting to $90° - 30° = 60°$ from the horizontal is legal and gives the same answer, but it is an extra step that exists only to rescue a rule you did not need.",
    "The components are equal only at 45°. At 30° the vertical component is much the larger."
  ]
},
{
  id: "qz-kin-vector-components-03",
  conceptId: "kin-vector-components",
  source: "CED 1.5",
  stem: "A student resolves a 30 m/s velocity and gets components of 24 m/s and 21 m/s. What should they conclude immediately?",
  options: [
    "The resolution is fine, since both components are smaller than 30 m/s.",
    "The resolution is wrong, because these components recombine to about 31.9 m/s rather than 30 m/s.",
    "The resolution is wrong, because two components can never both exceed half the magnitude.",
    "Nothing can be said without knowing the angle."
  ],
  answer: 1,
  why: "Perpendicular components must satisfy Pythagoras with the original magnitude: $\\sqrt{24^2 + 21^2} = 31.9$, not 30. That check takes a few seconds and catches a swapped or mis-copied trig value even when neither component looks suspicious on its own.",
  whyNot: [
    "Being smaller than the magnitude is necessary but not sufficient. Both of these pass that test and still fail the real one.",
    "There is no such rule: at 45° both components are about 0.71 of the magnitude, so both exceed half.",
    "The angle is not needed. Pythagoras constrains the pair whatever the angle happens to be."
  ]
},
{
  id: "qz-kin-vector-components-04",
  conceptId: "kin-vector-components",
  source: "CED 1.5",
  stem: "Why must the two axes used for resolving be perpendicular, rather than any two convenient directions?",
  options: [
    "Because sine and cosine are only defined for right triangles.",
    "Because non-perpendicular components would each contain part of the other",
    "Because the equation sheet only provides trigonometry for right triangles.",
    "Because a vector has only two components, and two directions must be perpendicular to be distinct."
  ],
  answer: 1,
  why: "Independence is the whole payoff. On perpendicular axes, changing one component does not change the other, which is what licenses splitting a two-dimensional problem into two one-dimensional ones — the method projectile motion rests on.",
  whyNot: [
    "Sine and cosine are defined for any angle; oblique components can be computed perfectly well. They are simply not independent, which is the objection that matters.",
    "The sheet's contents are a consequence of the choice, not a reason for it.",
    "Two directions can be distinct at any angle. It is not distinctness that is needed but non-interference."
  ]
},

{
  id: "qz-kin-projectile-01",
  conceptId: "kin-projectile",
  source: "CED 1.5",
  stem: "One ball is dropped from a table and, at the same instant, a second is fired horizontally from the same height. Ignoring air resistance, which lands first?",
  options: [
    "The dropped ball, because it travels the shorter path.",
    "The fired ball, because it is moving faster.",
    "They land at the same instant.",
    "It depends on how fast the second ball is fired."
  ],
  answer: 2,
  why: "The vertical column of the problem is the same for both — same starting height, same zero initial vertical velocity, same $a_y = -g$ — and the horizontal motion contributes nothing to it. Perpendicular components are independent, so the horizontal launch cannot change the fall time.",
  whyNot: [
    "Path length is not what the vertical equation contains. The fired ball covers more ground while falling exactly as fast downwards.",
    "It is moving faster, but only horizontally, and horizontal speed never appears in the vertical equations.",
    "This is the intuition the experiment is designed to test: vary the launch speed and the fall time stays the same, which is the point of the demonstration."
  ]
},
{
  id: "qz-kin-projectile-02",
  conceptId: "kin-projectile",
  source: "CED 1.5",
  stem: "At the highest point of a projectile's arc, what is zero?",
  options: [
    "Its velocity and its acceleration.",
    "Its velocity only.",
    "Its acceleration only.",
    "Its vertical velocity only."
  ],
  answer: 3,
  why: "The vertical component passes through zero at the peak; the horizontal component is still $v_{0x}$ and never changed. So the speed there is the smallest of the flight but not zero, and the acceleration is $g$ downwards, as everywhere else.",
  whyNot: [
    "Neither is zero. This compounds the two standard errors of this topic in one option.",
    "The full velocity is not zero because the projectile is still travelling horizontally — this is the most common wrong answer, imported from the straight-up throw.",
    "The acceleration is $g$ downwards for the entire flight. There is no point at which gravity stops."
  ]
},
{
  id: "qz-kin-projectile-03",
  conceptId: "kin-projectile",
  source: "CED 1.5",
  stem: "A ball is launched from level ground at 25 m/s, 37° above the horizontal, with $g \\approx 10$ m/s$^2$. What are its time of flight and its horizontal range?",
  options: [
    "1.5 s and 30 m",
    "3.0 s and 60 m",
    "3.0 s and 75 m",
    "5.0 s and 100 m"
  ],
  answer: 1,
  why: "$v_{0y} = 15$ m/s gives 1.5 s to the top and, since the landing height matches the launch height, 3.0 s in total. The horizontal column then does the bookkeeping: $R = v_{0x}t = 20 \\times 3.0 = 60$ m.",
  whyNot: [
    "1.5 s is the time to the peak, and 30 m is how far it has gone by then — half the flight in both columns.",
    "The range uses the horizontal component, 20 m/s, not the launch speed of 25 m/s. Using 25 gives 75 m.",
    "5.0 s would require $v_{0y} = 25$ m/s, which is the whole launch speed rather than its vertical component."
  ]
},
{
  id: "qz-kin-projectile-04",
  conceptId: "kin-projectile",
  source: "CED 1.5",
  stem: "A projectile is launched at an angle from the edge of a cliff and lands on the beach below. Which move is **not** legitimate?",
  options: [
    "Using $t = \\frac{2v_0\\sin\\theta}{g}$ for the time of flight.",
    "Solving the vertical equation with a negative final displacement to find the flight time.",
    "Using the same time $t$ in both the horizontal and vertical columns.",
    "Treating the horizontal velocity as unchanged for the whole flight."
  ],
  answer: 0,
  why: "That formula is derived from the assumption that the projectile lands at its launch height, which is exactly what a cliff launch violates. Go back to the vertical equation with the real displacement — one line of work, and correct for any landing height.",
  whyNot: [
    "This is the right method: set $\\Delta y$ to the drop, with its sign, and solve the quadratic for $t$.",
    "The shared clock is the whole method. The two columns exchange nothing else.",
    "With no horizontal acceleration the horizontal velocity is constant, whatever the vertical motion does."
  ]
},

/* ---- Unit 2 · Force and translational dynamics --------------------------- */

{
  id: "qz-dyn-system-01",
  conceptId: "dyn-system",
  source: "CED 2.1",
  stem: "Two blocks joined by a light string are pulled across a frictionless table by a force applied to the front block. A student writes $F - T = (m_A + m_B)a$ for the pair. What is wrong?",
  options: [
    "The tension should be added rather than subtracted, since it acts forwards on the rear block.",
    "Nothing, provided $T$ is the tension at the front block only.",
    "With the boundary drawn round both blocks the tension is internal, so it must not appear in the equation at all.",
    "The equation needs a friction term, since a string always exerts friction on the blocks."
  ],
  answer: 2,
  why: "Internal forces come in third-law pairs with both members inside the boundary, so they cancel in the sum. Once the system encloses both ends of the string, the only forces that may appear are the external ones — here just the applied force.",
  whyNot: [
    "Neither sign is admissible. The tension pulls the rear block forwards and the front block backwards, and both of those are inside the boundary.",
    "There is only one tension in an ideal string, and its two ends are both inside the system. The problem is not which value of $T$ to use but that no $T$ belongs here.",
    "An ideal string is massless and frictionless, and in any case friction from the string on the blocks would also be internal."
  ]
},
{
  id: "qz-dyn-system-02",
  conceptId: "dyn-system",
  source: "CED 2.1",
  stem: "Two blocks on a frictionless table, 2.0 kg behind and 4.0 kg in front, are joined by a light string. An 18 N horizontal force pulls the front block. What are the acceleration and the tension?",
  options: [
    "$a = 3.0$ m/s$^2$, $T = 6.0$ N",
    "$a = 3.0$ m/s$^2$, $T = 12$ N",
    "$a = 4.5$ m/s$^2$, $T = 9.0$ N",
    "$a = 9.0$ m/s$^2$, $T = 18$ N"
  ],
  answer: 0,
  why: "Whole system first: $18 / 6.0 = 3.0$ m/s$^2$, with the tension invisible because it is internal. Then redraw the boundary round the 2.0 kg block alone, where the tension is the only external horizontal force: $T = 2.0 \\times 3.0 = 6.0$ N.",
  whyNot: [
    "12 N is $m_{\\text{front}}a$, which is the net force on the front block — not the tension, since the front block also feels the 18 N pull.",
    "4.5 m/s$^2$ divides the applied force by the front block's mass alone. The string makes both blocks accelerate together, so the whole mass resists.",
    "9.0 m/s$^2$ divides by the rear block's mass, and a tension equal to the applied force would leave the front block with no net force at all."
  ]
},
{
  id: "qz-dyn-system-03",
  conceptId: "dyn-system",
  source: "CED 2.1",
  stem: "Why is choosing the system boundary described as the move that decides how long a dynamics problem takes?",
  options: [
    "Because a badly chosen boundary makes the answer wrong, while a good one makes it right.",
    "Because the boundary determines which forces are internal and therefore invisible",
    "Because the equation sheet prints a different equation for each choice of system.",
    "Because only the largest possible system is valid, and smaller ones give inconsistent accelerations."
  ],
  answer: 1,
  why: "The physics does not change with the boundary, but the bookkeeping does. Enclosing both ends of a connection hides its force; cutting through it makes that force external and therefore solvable for. The standard two-step method exploits exactly this.",
  whyNot: [
    "Any consistent choice gives the right answer. What a poor choice costs is extra unknowns, not correctness.",
    "There is one second-law equation, and no equation on the sheet mentions how you drew the boundary.",
    "Smaller systems are not only valid but necessary — the second step of the standard method is a boundary round one object."
  ]
},
{
  id: "qz-dyn-system-04",
  conceptId: "dyn-system",
  source: "CED 2.1",
  stem: "Can parts of a system behave differently from the system as a whole?",
  options: [
    "No — modelling a system as one object requires every part to move identically.",
    "Only if the system is deformable, which AP Physics 1 excludes.",
    "Only when external forces act, since internal forces move all parts equally.",
    "Yes — a rolling wheel's centre of mass moves steadily while points on its rim speed up and slow down."
  ],
  answer: 3,
  why: "Treating a system as a single object describes its **centre of mass**, and nothing more. The parts may do something quite different, which is why the centre of mass is singled out as the point whose motion obeys the second law for the system.",
  whyNot: [
    "The single-object model makes a claim about one point, not about every particle in the body.",
    "Rigid bodies show the effect too: a rolling wheel is rigid, and its rim points still accelerate and decelerate.",
    "Internal forces cannot move the centre of mass, but they certainly move the parts relative to one another — that is what an explosion is."
  ]
},

{
  id: "qz-dyn-center-of-mass-01",
  conceptId: "dyn-center-of-mass",
  source: "CED 2.1",
  stem: "Blocks of 2.0 kg at $x = 0$, 3.0 kg at $x = 0.40$ m and 5.0 kg at $x = 1.00$ m lie on a line. Where is the centre of mass?",
  options: [
    "$x = 0.47$ m",
    "$x = 0.62$ m",
    "$x = 0.50$ m",
    "$x = 6.2$ m"
  ],
  answer: 1,
  why: "$x_{cm} = \\frac{\\sum m_i x_i}{\\sum m_i} = \\frac{0 + 1.2 + 5.0}{10} = 0.62$ m. The heaviest block pulls the point towards itself, which is the check worth doing before any arithmetic.",
  whyNot: [
    "0.47 m is the plain average of the three positions, $\\frac{0 + 0.40 + 1.00}{3}$. The giveaway is that changing any mass would not move it.",
    "0.50 m is the midpoint of the arrangement, which would only be the centre of mass if the masses were symmetric about it.",
    "6.2 m is the numerator $\\sum m_i x_i$ without dividing by the total mass — the units give it away as kg$\\cdot$m rather than m."
  ]
},
{
  id: "qz-dyn-center-of-mass-02",
  conceptId: "dyn-center-of-mass",
  source: "CED 2.1",
  stem: "A spanner is thrown spinning across a room. Ignoring air resistance, what path does its centre of mass follow?",
  options: [
    "A parabola, as though the spanner were a point particle.",
    "A wavy path, because the spinning shifts the mass from side to side.",
    "A straight line, because the internal forces cancel.",
    "A path that cannot be predicted without knowing the spanner's shape."
  ],
  answer: 0,
  why: "Internal forces cannot move the centre of mass, so only gravity — an external force — acts on it. Its acceleration is $g$ downwards throughout, which is a projectile, however chaotically the body tumbles around that point.",
  whyNot: [
    "Individual points on the spanner do trace loops, but the centre of mass is defined so that those internal motions cancel about it.",
    "Cancelling internal forces removes any *internal* contribution; gravity is still external and still curves the path.",
    "The shape affects how it spins, not how its centre of mass falls. That independence is the reason the centre of mass is worth defining."
  ]
},
{
  id: "qz-dyn-center-of-mass-03",
  conceptId: "dyn-center-of-mass",
  source: "CED 2.1",
  stem: "A 1.0 kg mass sits at $x = 0$ and a 3.0 kg mass at $x = 4.0$ m. Where is the centre of mass, and what happens to it if the origin is moved 2.0 m to the left?",
  options: [
    "At $x = 2.0$ m, and it becomes $x = 4.0$ m in the new coordinates.",
    "At $x = 1.0$ m, and it becomes $x = 3.0$ m in the new coordinates.",
    "At $x = 3.0$ m, and it becomes $x = 5.0$ m in the new coordinates — the same physical point, relabelled.",
    "At $x = 3.0$ m, and it stays at $x = 3.0$ m, because the centre of mass is independent of the origin."
  ],
  answer: 2,
  why: "$\\frac{(1.0)(0) + (3.0)(4.0)}{4.0} = 3.0$ m, three quarters of the way towards the heavier mass. Moving the origin changes every coordinate by the same amount, so the *number* changes while the physical point does not.",
  whyNot: [
    "2.0 m is the midpoint, which ignores the three-to-one mass ratio.",
    "1.0 m places the centre of mass nearer the lighter block, which is the mass weighting applied backwards.",
    "The physical point is origin-independent, but its coordinate is not — that is what a coordinate is."
  ]
},
{
  id: "qz-dyn-center-of-mass-04",
  conceptId: "dyn-center-of-mass",
  source: "CED 2.1",
  stem: "What does the CED say you may be asked to calculate a centre of mass for?",
  options: [
    "Any rigid body, using integration where necessary.",
    "Systems of five or fewer particles in a two-dimensional arrangement, or highly symmetrical systems.",
    "Only systems of two particles on a line.",
    "Only bodies whose mass distribution is uniform."
  ],
  answer: 1,
  why: "The boundary is explicit, and it is worth knowing because it tells you what a question can ask. Beyond five particles, or for an irregular continuous body, the exam works qualitatively or leans on symmetry.",
  whyNot: [
    "Integration is not part of an algebra-based course, and the CED says so by limiting the cases.",
    "Two-particle problems are the easy case, not the limit — two-dimensional arrangements of up to five are in scope.",
    "Uniformity helps by putting the centre of mass on the symmetry lines, but non-uniform collections of particles are exactly what the summation handles."
  ]
},

{
  id: "qz-dyn-force-interaction-01",
  conceptId: "dyn-force-interaction",
  source: "CED 2.2",
  stem: "A ball has left the thrower's hand and is rising. Air resistance is negligible. Which forces act on it?",
  options: [
    "Gravity and the force of the throw, with the throw larger while it rises.",
    "Gravity, the force of the throw, and inertia carrying it upwards.",
    "Gravity only.",
    "No forces, since it is in free flight."
  ],
  answer: 2,
  why: "A force is an interaction between two objects, so it ends when the interaction does. Once contact with the hand is lost there is no ‘force of the throw’ left to name, and gravity is the only interaction remaining.",
  whyNot: [
    "This is the commonest error in the topic. If a residual upward force existed it would have to be exerted by some object, and there is none in contact with the ball.",
    "Inertia is a property measured by mass, not a force, and it never appears on a free-body diagram.",
    "Gravity does not stop acting in flight — it is what curves the path and eventually brings the ball down."
  ]
},
{
  id: "qz-dyn-force-interaction-02",
  conceptId: "dyn-force-interaction",
  source: "CED 2.2",
  stem: "Which naming template does a real force always fit?",
  options: [
    "‘The force of X on Y’, with X and Y different objects.",
    "‘The force of motion of Y’, where Y is the moving object.",
    "‘The force in Y’, since forces are stored in objects.",
    "‘The force of Y on itself’, when an object accelerates under its own power."
  ],
  answer: 0,
  why: "Naming both objects is what makes a free-body diagram checkable: if you cannot say which other object is exerting it, you have not found a force. It is also what makes third-law partners mechanical to find — swap the two names.",
  whyNot: [
    "Motion is not an agent. This phrasing is exactly what the naming discipline is designed to expose.",
    "A force is an interaction, not a possession. Nothing is stored in an object and spent later.",
    "No object can exert a net force on itself. A car accelerates because the road pushes it, which is why it cannot do so on frictionless ice."
  ]
},
{
  id: "qz-dyn-force-interaction-03",
  conceptId: "dyn-force-interaction",
  source: "CED 2.2",
  stem: "Which of these is a genuine force that could appear on a free-body diagram in this course?",
  options: [
    "The inertia of the object.",
    "The momentum of the object.",
    "The centripetal force, as an arrow in addition to the tension.",
    "The normal force of the floor on the crate."
  ],
  answer: 3,
  why: "It names two objects and describes a contact interaction — the electric repulsion between the atoms of the two surfaces, seen macroscopically. That is what qualifies it.",
  whyNot: [
    "Inertia is a property of the object, measured by its mass. It resists changes in motion; it does not push.",
    "Momentum is a property of the motion. It appears in the impulse equations, never as an arrow on a diagram.",
    "Centripetal is a *role* played by a real force. Drawing it alongside the tension that is playing that role counts one force twice."
  ]
},
{
  id: "qz-dyn-force-interaction-04",
  conceptId: "dyn-force-interaction",
  source: "CED 2.2",
  stem: "Which non-contact forces are in scope for AP Physics 1?",
  options: [
    "Gravitational, electric and magnetic.",
    "Gravitational only.",
    "Gravitational and electric, but not magnetic.",
    "None — all forces in this course arise from contact."
  ],
  answer: 1,
  why: "Electric and magnetic interactions belong to Physics 2. The narrowing is genuinely useful: if two objects in your problem are not touching and neither is an astronomical body, there is probably no force between them.",
  whyNot: [
    "Electric and magnetic forces exist, but are not assessed in this course.",
    "Electric forces are Physics 2 material and do not appear on this exam's free-body diagrams.",
    "Gravity acts across a gap and is central to this course, so the contact-only claim is false."
  ]
},

{
  id: "qz-dyn-free-body-01",
  conceptId: "dyn-free-body",
  source: "CED 2.2",
  stem: "A block slides down a ramp inclined at $\\theta$. Which set of axes makes the algebra shortest, and why?",
  options: [
    "Horizontal and vertical, because gravity is then already on an axis.",
    "Horizontal and vertical, because the normal force is then already on an axis.",
    "Tilted, with one axis along the slope, because the acceleration then lies on one axis only.",
    "Either — the axis choice cannot affect how much algebra is needed."
  ],
  answer: 2,
  why: "Putting an axis parallel to the acceleration collapses the perpendicular equation to a balance, and leaves only gravity needing to be resolved. With horizontal and vertical axes you would have to resolve the normal force and the friction force, and track a non-zero vertical acceleration as well.",
  whyNot: [
    "Gravity is on an axis, but the acceleration is not — so both equations couple and the block gets a vertical acceleration to account for.",
    "On a ramp the normal force is perpendicular to the slope, not vertical, so this choice puts it on neither axis.",
    "Both choices give the same answer, and one of them roughly doubles the work. Axis choice is a real decision."
  ]
},
{
  id: "qz-dyn-free-body-02",
  conceptId: "dyn-free-body",
  source: "CED 2.2",
  stem: "On an AP free-body diagram for a block on an incline, which of these must **not** be drawn?",
  options: [
    "Arrows for $mg\\sin\\theta$ and $mg\\cos\\theta$ alongside the arrow for $mg$.",
    "An arrow for the normal force, perpendicular to the surface.",
    "An arrow for friction, along the surface.",
    "An arrow for the gravitational force, vertically downwards."
  ],
  answer: 0,
  why: "The exam asks for forces, not components. Drawing both components while the full gravitational arrow is still there shows one interaction three times, and the resolving belongs in the algebra off to the side.",
  whyNot: [
    "The normal force is a real force from a real interaction and belongs on the diagram.",
    "Friction is a real contact force and belongs on the diagram whenever the surfaces are rough.",
    "Gravity is drawn vertically downwards, full size — it is the component versions that are excluded."
  ]
},
{
  id: "qz-dyn-free-body-03",
  conceptId: "dyn-free-body",
  source: "CED 2.2",
  stem: "A 4.0 kg block is released from rest on a frictionless 30° ramp. Taking $g = 9.8$ m/s$^2$, what are the normal force and the acceleration?",
  options: [
    "$F_N = 39$ N, $a = 9.8$ m/s$^2$",
    "$F_N = 34$ N, $a = 4.9$ m/s$^2$",
    "$F_N = 39$ N, $a = 4.9$ m/s$^2$",
    "$F_N = 34$ N, $a = 8.5$ m/s$^2$"
  ],
  answer: 1,
  why: "Perpendicular: $F_N = mg\\cos 30° = 39.2 \\times 0.866 = 34$ N. Parallel: $a = g\\sin 30° = 4.9$ m/s$^2$. Each equation uses a different trig function because the two components are on different axes.",
  whyNot: [
    "39 N is $mg$ — the whole weight — and 9.8 m/s$^2$ is free fall. Both would be right only for a vertical drop, that is, $\\theta = 90°$.",
    "$F_N = mg$ on an incline is the standard error: the cosine is less than one for every real ramp.",
    "8.5 m/s$^2$ is $g\\cos 30°$ — the two trig functions swapped, which would make a gentle ramp nearly as fast as a free fall."
  ]
},
{
  id: "qz-dyn-free-body-04",
  conceptId: "dyn-free-body",
  source: "CED 2.2",
  stem: "Which item belongs on a free-body diagram?",
  options: [
    "The object's velocity, drawn as a longer arrow when it is moving fast.",
    "The object's acceleration, drawn in a different colour.",
    "The force the object exerts on the surface it rests on.",
    "Every force exerted on the object, drawn from a single dot."
  ],
  answer: 3,
  why: "A free-body diagram answers one question: what is pushing or pulling on *this* object. Everything else — its motion, and the forces it exerts on other things — belongs somewhere else in the solution.",
  whyNot: [
    "Velocity is not a force. Drawing it invites the reader to add it into $\\sum F$.",
    "Acceleration is the *result* of the forces, and putting it on the diagram is how an object ends up with a phantom extra push.",
    "That is the third-law partner of the normal force, and it acts on the surface, not on the object. Only forces on the object go here."
  ]
},

{
  id: "qz-dyn-third-law-01",
  conceptId: "dyn-third-law",
  source: "CED 2.3",
  stem: "A book rests on a table. Are the gravitational force of Earth on the book and the normal force of the table on the book a third-law pair?",
  options: [
    "Yes — they are equal in magnitude and opposite in direction.",
    "Yes, but only while the book is at rest.",
    "No — they act on the same object",
    "No — they are a third-law pair only if the table is rigid."
  ],
  answer: 2,
  why: "A third-law pair acts on two *different* objects, comes from one interaction, and is always equal. These two act on one object, come from different interactions, and are equal only while $a_y = 0$ — put the book in an accelerating lift and the equality fails while the third law never does.",
  whyNot: [
    "Equal and opposite is not sufficient. The test is whether the two forces act on the same thing; if they do, they are a balanced pair, not a third-law pair.",
    "The qualifier gets the physics backwards: a third-law pair holds always, so a relation that needs the book to be at rest cannot be one.",
    "Rigidity is irrelevant. The partner of the normal force of the table on the book is the normal force of the book on the table, whatever the table is made of."
  ]
},
{
  id: "qz-dyn-third-law-02",
  conceptId: "dyn-third-law",
  source: "CED 2.3",
  stem: "A 4000 kg lorry collides head-on with a 1500 kg car. Which statement is correct?",
  options: [
    "The lorry exerts a larger force on the car than the car exerts on the lorry.",
    "The forces are equal in magnitude, and the car experiences the larger acceleration.",
    "The forces are equal, and so are the accelerations.",
    "The car exerts the larger force, because it is brought to a stop more suddenly."
  ],
  answer: 1,
  why: "The two forces are one interaction seen from two sides, so they are equal in magnitude whatever the masses. The same force divided by a much smaller mass gives a much larger acceleration — which is why the car and its occupants suffer more, not because they were pushed harder.",
  whyNot: [
    "Mass affects the *response* to a force, not the size of the force in an interaction.",
    "The forces are equal, but $a = F/m$, and the masses differ by a factor of about 2.7.",
    "‘Stopped more suddenly’ describes the car's acceleration, which is the effect, not the cause."
  ]
},
{
  id: "qz-dyn-third-law-03",
  conceptId: "dyn-third-law",
  source: "CED 2.3",
  stem: "What is the third-law partner of ‘the gravitational force of Earth on a falling apple’?",
  options: [
    "The gravitational force of the apple on Earth.",
    "The normal force of the ground on the apple, once it lands.",
    "The air resistance on the apple.",
    "There is none — gravity is a non-contact force and has no partner."
  ],
  answer: 0,
  why: "Swap the two object names and keep the type of force the same. The apple really does pull the Earth with the same magnitude of force; the Earth's acceleration in response is simply unmeasurably small.",
  whyNot: [
    "That force acts on the apple as well, and it comes from a different interaction altogether.",
    "Air resistance is a separate interaction, between the apple and the air, with its own partner.",
    "The third law applies to every interaction, contact or not."
  ]
},
{
  id: "qz-dyn-third-law-04",
  conceptId: "dyn-third-law",
  source: "CED 2.3",
  stem: "Why do internal forces drop out of Newton's second law for a system?",
  options: [
    "Because internal forces are usually much smaller than external ones.",
    "Because internal forces act along the line joining the parts and so cannot do work.",
    "Because every internal force has its third-law partner inside the same boundary, so the pair sums to zero.",
    "Because the system is modelled as a point particle, which has no interior."
  ],
  answer: 2,
  why: "That cancellation is the formal justification for the whole-system shortcut: internal interactions cannot change the motion of the centre of mass, so only external forces appear.",
  whyNot: [
    "Size has nothing to do with it — the internal forces in a collision are enormous and still cancel exactly.",
    "Internal forces frequently do work, which is how energy moves between the parts of a system.",
    "The point-particle model is a consequence of the cancellation, not a reason for it."
  ]
},

{
  id: "qz-dyn-tension-01",
  conceptId: "dyn-tension",
  source: "CED 2.3",
  stem: "Blocks of 3.0 kg and 5.0 kg hang from the ends of a light string over an ideal pulley and are released. Taking $g = 9.8$ m/s$^2$, what are the acceleration and the tension?",
  options: [
    "$a = 2.45$ m/s$^2$, $T = 49$ N",
    "$a = 2.45$ m/s$^2$, $T \\approx 37$ N",
    "$a = 9.8$ m/s$^2$, $T = 29$ N",
    "$a = 2.45$ m/s$^2$, with two different tensions of 29 N and 49 N"
  ],
  answer: 1,
  why: "$a = \\frac{(5.0 - 3.0)g}{8.0} = 2.45$ m/s$^2$, and then either block gives the same tension: $T = m_1(g + a) = 3.0 \\times 12.25 \\approx 37$ N. Note it lies between the two weights, which is the sanity check.",
  whyNot: [
    "49 N is the weight of the 5.0 kg block, which would be the tension only if that block were in equilibrium — but it is accelerating downwards.",
    "The blocks are not in free fall: the string transmits the lighter block's weight, so the acceleration is well under $g$.",
    "An ideal pulley changes the direction of the tension, not its magnitude. One massless string over one ideal pulley carries one tension."
  ]
},
{
  id: "qz-dyn-tension-02",
  conceptId: "dyn-tension",
  source: "CED 2.3",
  stem: "A 3.0 kg block hangs from a string and accelerates **upwards** at 2.0 m/s$^2$. What is the tension? Use $g = 9.8$ m/s$^2$.",
  options: [
    "29.4 N",
    "6.0 N",
    "35.4 N",
    "23.4 N"
  ],
  answer: 2,
  why: "$T - mg = ma$, so $T = m(g + a) = 3.0 \\times 11.8 = 35.4$ N. It must exceed the weight, because something has to produce the upward net force.",
  whyNot: [
    "29.4 N is $mg$ — the equilibrium value, and the standard error here. A block hanging with $T = mg$ does not accelerate.",
    "6.0 N is $ma$, the *net* force. The tension has to overcome the weight as well as supply that net force.",
    "23.4 N is $m(g - a)$, which is the tension for a block accelerating *downwards* — the sign of the acceleration has been taken the wrong way."
  ]
},
{
  id: "qz-dyn-tension-03",
  conceptId: "dyn-tension",
  source: "CED 2.3",
  stem: "Where is the tension largest in a heavy hanging chain, and how does this course treat that fact?",
  options: [
    "At the bottom, quantitatively.",
    "At the top, and the course expects a qualitative description only.",
    "It is the same throughout, exactly as in an ideal string.",
    "At the middle, where the chain carries the most weight."
  ],
  answer: 1,
  why: "Each link supports the weight of everything below it, so the tension grows from bottom to top. An ideal string has no weight to support, which is why its tension is uniform — the gradient is exactly what idealising removes.",
  whyNot: [
    "The bottom link supports nothing below it, so the tension there is smallest.",
    "Uniform tension is the *ideal* string's property, and this question is about a real one with mass.",
    "The middle carries half the chain below it — less than the top does."
  ]
},
{
  id: "qz-dyn-tension-04",
  conceptId: "dyn-tension",
  source: "CED 2.3",
  stem: "In a two-block pulley problem, why is it worth defining positive as ‘the direction the system actually accelerates’?",
  options: [
    "Because the equation sheet requires the acceleration to be positive.",
    "Because the tension would otherwise come out negative, which is impossible.",
    "Because otherwise the two blocks would have different acceleration magnitudes.",
    "Because both blocks then carry the same $a$ with the same sign, so their equations can simply be added."
  ],
  answer: 3,
  why: "The convention is bookkeeping that pays: down for the heavy block and up for the light one means one unknown $a$ appears identically in both equations, and adding them eliminates the tension in one step.",
  whyNot: [
    "The sheet says nothing about sign conventions; they are yours to fix.",
    "A negative tension would indeed signal an error, but the convention is chosen for convenience, not to protect the sign of $T$.",
    "Equal magnitudes follow from the string being inextensible, whatever convention you adopt."
  ]
},

{
  id: "qz-dyn-first-law-01",
  conceptId: "dyn-first-law",
  source: "CED 2.4",
  stem: "A parachutist descends at a steady 12 m/s. Which statement is correct?",
  options: [
    "The net force on her is zero, and she is in translational equilibrium.",
    "The net force on her is downwards, since she is moving downwards.",
    "The net force on her is upwards, since drag exceeds gravity while she descends.",
    "She cannot be in equilibrium, because equilibrium means being at rest."
  ],
  answer: 0,
  why: "Equilibrium is a statement about the *change* in velocity, not about its value. Constant velocity — of any size, in any direction — means the forces sum to zero.",
  whyNot: [
    "A steady velocity requires no net force at all; a downward net force would make her speed up.",
    "Drag exceeding gravity would decelerate her, so the speed could not stay at 12 m/s.",
    "This is the standard misreading of the word. A lift moving up at a steady speed is in equilibrium too."
  ]
},
{
  id: "qz-dyn-first-law-02",
  conceptId: "dyn-first-law",
  source: "CED 2.4",
  stem: "A 20 kg sign hangs at rest from two cables, each at 30° above the horizontal, sharing the load equally. What is the tension in each cable? Use $g = 9.8$ m/s$^2$.",
  options: [
    "98 N",
    "196 N",
    "113 N",
    "340 N"
  ],
  answer: 1,
  why: "Vertically, $2T\\sin 30° = mg$, so $T = \\frac{196}{2 \\times 0.5} = 196$ N. Each cable carries more than half the weight because only part of its pull is vertical — the shallower the angle, the worse it gets.",
  whyNot: [
    "98 N is half the weight, which would be right only if the cables pulled straight up.",
    "113 N comes from using the cosine instead of the sine, that is, resolving as though the angle were measured from the vertical.",
    "340 N uses $2T\\cos 30° = mg$ in the other direction, and would make the horizontal components fail to cancel."
  ]
},
{
  id: "qz-dyn-first-law-03",
  conceptId: "dyn-first-law",
  source: "CED 2.4",
  stem: "Can an object's forces be balanced along one axis and unbalanced along another?",
  options: [
    "No — equilibrium is a property of the whole object.",
    "Only for objects moving in a circle.",
    "Yes — a projectile has balanced horizontal forces and unbalanced vertical ones, so only $v_y$ changes.",
    "Yes, but only in non-inertial reference frames."
  ],
  answer: 2,
  why: "One vector equation is two independent scalar equations, so equilibrium can hold on one axis and fail on the other. Projectile motion is the clean example, and it is why the horizontal velocity is constant while the vertical one is not.",
  whyNot: [
    "Equilibrium is a statement about a direction. $\\sum F_x = 0$ and $\\sum F_y \\ne 0$ is a perfectly ordinary state of affairs.",
    "Circular motion is the case where the *radial* forces are unbalanced; it is an instance of the phenomenon, not the only one.",
    "Nothing here requires a non-inertial frame; the projectile is analysed in the ordinary ground frame."
  ]
},
{
  id: "qz-dyn-first-law-04",
  conceptId: "dyn-first-law",
  source: "CED 2.4",
  stem: "You are on a bus that brakes hard, and your bag slides forwards along the seat with nothing touching it. What does this show?",
  options: [
    "That a forward force acts on the bag while the bus brakes.",
    "That the bag's inertia acts as a forward force.",
    "That friction between bag and seat has reversed direction.",
    "That the bus is not an inertial frame"
  ],
  answer: 3,
  why: "An inertial frame is one in which the first law holds. Inside the braking bus the bag appears to accelerate with no force, so the bus fails that test. From the road nothing strange happens at all — the bus slowed and the bag did not.",
  whyNot: [
    "No object is exerting it, which is exactly why the observation is evidence about the frame rather than about a force.",
    "Inertia is not a force; it is the reason no force is needed to keep the bag moving.",
    "Friction on the bag acts backwards relative to its sliding, which opposes the forward slide rather than causing it."
  ]
},

{
  id: "qz-dyn-second-law-01",
  conceptId: "dyn-second-law",
  source: "CED 2.5",
  stem: "A 25 kg crate on a frictionless floor is pulled by a rope at 37° above the horizontal with a tension of 100 N. What is its horizontal acceleration, and what is the normal force? Use $g = 9.8$ m/s$^2$, $\\cos 37° = 0.8$.",
  options: [
    "$a = 4.0$ m/s$^2$, $F_N = 245$ N",
    "$a = 3.2$ m/s$^2$, $F_N = 245$ N",
    "$a = 3.2$ m/s$^2$, $F_N = 185$ N",
    "$a = 4.0$ m/s$^2$, $F_N = 185$ N"
  ],
  answer: 2,
  why: "Horizontally, only the component along the floor accelerates the crate: $a = \\frac{100 \\times 0.8}{25} = 3.2$ m/s$^2$. Vertically, the rope's upward component lightens the crate: $F_N = 245 - 60 = 185$ N.",
  whyNot: [
    "4.0 m/s$^2$ uses the full 100 N horizontally, and 245 N assumes the rope does nothing vertically. Both errors come from ignoring the angle.",
    "The acceleration is right; $F_N = mg$ ignores the rope's vertical component, which is the standard normal-force error.",
    "$F_N$ is right; using the full tension horizontally overstates the acceleration."
  ]
},
{
  id: "qz-dyn-second-law-02",
  conceptId: "dyn-second-law",
  source: "CED 2.5",
  stem: "A 30 N horizontal push and a 40 N vertical lift act on the same object. What is the net force?",
  options: [
    "70 N, at 45° above the horizontal.",
    "50 N, at about 53° above the horizontal.",
    "10 N, vertically upwards.",
    "It cannot be found without knowing the mass."
  ],
  answer: 1,
  why: "Forces on perpendicular axes do not add as numbers. $\\sqrt{30^2 + 40^2} = 50$ N, with $\\tan\\theta = \\frac{40}{30}$, giving about 53° — the 3–4–5 triangle again.",
  whyNot: [
    "70 N is the arithmetic sum, which would only be right if both forces pointed the same way.",
    "10 N is the difference, which is what you would compute if the two forces were antiparallel.",
    "Mass is needed for the acceleration, not for the net force."
  ]
},
{
  id: "qz-dyn-second-law-03",
  conceptId: "dyn-second-law",
  source: "CED 2.5",
  stem: "Whose acceleration is $\\vec{a}_{sys}$ in $\\vec{a}_{sys} = \\vec{F}_{net}/m_{sys}$?",
  options: [
    "The system's centre of mass.",
    "Every particle in the system, all of which share it.",
    "The heaviest object in the system.",
    "Whichever object the external force is applied to."
  ],
  answer: 0,
  why: "That is precisely what internal forces cancelling buys you: the external forces fix the motion of one point, the centre of mass, and say nothing about how the parts move around it.",
  whyNot: [
    "Parts of a system can accelerate quite differently — the rim of a rolling wheel is the standard example.",
    "No object is privileged. A heavy part contributes more to the weighted average and is not itself the answer.",
    "The point of the whole-system equation is that it does not matter where the external force is applied."
  ]
},
{
  id: "qz-dyn-second-law-04",
  conceptId: "dyn-second-law",
  source: "CED 2.5",
  stem: "In the standard dynamics method, what comes immediately after drawing the free-body diagram?",
  options: [
    "Substituting numbers, so the arithmetic is done while the diagram is fresh.",
    "Writing $\\sum F = ma$ for both axes at once as a single vector equation.",
    "Choosing axes, with one parallel to the acceleration.",
    "Solving for the normal force, which every problem needs first."
  ],
  answer: 2,
  why: "Choose the system, draw the diagram, choose axes, write one equation per axis with signs read off those axes, then solve. Putting the axis choice before the equations is what keeps the perpendicular equation to a simple balance.",
  whyNot: [
    "Numbers go in last. Substituting before the equations are set up is how signs get decided case by case rather than from the axes.",
    "The vector equation is where you start conceptually, but it has to be resolved onto axes before it can be solved — and the axes have to be chosen first.",
    "Plenty of problems never need the normal force, and where they do it usually falls out of the perpendicular equation."
  ]
},

{
  id: "qz-dyn-gravitation-01",
  conceptId: "dyn-gravitation",
  source: "CED 2.6",
  stem: "The gravitational force between two objects is 36 N. Their separation is tripled and nothing else changes. What is the new force?",
  options: [
    "12 N",
    "4.0 N",
    "108 N",
    "324 N"
  ],
  answer: 1,
  why: "The law is inverse *square*: $r \\to 3r$ divides the force by $3^2 = 9$, so $36 / 9 = 4.0$ N.",
  whyNot: [
    "12 N divides by three, which would be right for an inverse-first-power law. The square is the whole point of the name.",
    "108 N multiplies by three — the force falls with distance, it does not grow.",
    "324 N multiplies by nine, inverting the relationship entirely."
  ]
},
{
  id: "qz-dyn-gravitation-02",
  conceptId: "dyn-gravitation",
  source: "CED 2.6",
  stem: "Why does the equation sheet give $g$ as both 9.8 m/s$^2$ and 9.8 N/kg?",
  options: [
    "They are different quantities that happen to be numerically close near Earth's surface.",
    "The first is used for falling objects, the second for objects at rest.",
    "They are the same quantity read two ways",
    "The N/kg version is a typographical convention with no physical content."
  ],
  answer: 2,
  why: "Field strength is defined without reference to any particular object — newtons per kilogram. Put an object in that field with nothing else acting and its acceleration is numerically the same number, which is why one symbol carries both units.",
  whyNot: [
    "They are the same number for a reason, not by coincidence: dividing N by kg gives m/s$^2$ exactly.",
    "The field strength does not change when an object stops moving. Both readings apply at all times.",
    "N/kg is the unit of the field-strength reading and carries real content — force per unit mass."
  ]
},
{
  id: "qz-dyn-gravitation-03",
  conceptId: "dyn-gravitation",
  source: "CED 2.6",
  stem: "Which statement about mass and weight is correct?",
  options: [
    "Mass is in kilograms and is the same everywhere; weight is a force in newtons",
    "Mass and weight are the same quantity in different units.",
    "Weight is measured in kilograms and mass in newtons.",
    "Mass changes on the Moon, which is why astronauts weigh less there."
  ],
  answer: 0,
  why: "Mass is a property of the object; weight is the gravitational force an astronomical body exerts on it, $F_g = mg$ near a surface. Take the object to the Moon and the mass is unchanged while the weight falls to about a sixth.",
  whyNot: [
    "They are not the same quantity: one is a scalar property, the other a force that varies with where you are.",
    "This reverses the units. Kilograms measure mass; newtons measure force.",
    "The astronaut's mass is identical on the Moon. What changed is the field strength, and therefore the weight."
  ]
},
{
  id: "qz-dyn-gravitation-04",
  conceptId: "dyn-gravitation",
  source: "CED 2.6",
  stem: "What is the significance of inertial mass and gravitational mass being experimentally equivalent?",
  options: [
    "It explains why gravitational forces obey an inverse-square law.",
    "It explains why all objects fall with the same acceleration regardless of mass.",
    "It explains why weight is measured in newtons rather than kilograms.",
    "It explains why internal forces cancel within a system."
  ],
  answer: 1,
  why: "The mass that sets the gravitational pull is the same mass that resists being accelerated, so it cancels in $a = F_g/m = g$. There is no obvious reason those two roles should be played by the same number, and that they are is a measured fact.",
  whyNot: [
    "The inverse-square dependence is about distance and is quite separate from what mass does.",
    "The units follow from force being mass times acceleration, not from the equivalence.",
    "Internal forces cancel because of the third law, which needs nothing about mass at all."
  ]
},

{
  id: "qz-dyn-normal-apparent-weight-01",
  conceptId: "dyn-normal-apparent-weight",
  source: "CED 2.6",
  stem: "A 60 kg student stands on a scale in a lift accelerating **downwards** at 2.0 m/s$^2$. What does the scale read, and what is the gravitational force on the student? Use $g = 9.8$ m/s$^2$.",
  options: [
    "Reads 468 N; gravitational force 468 N.",
    "Reads 708 N; gravitational force 588 N.",
    "Reads 468 N; gravitational force 588 N.",
    "Reads 588 N; gravitational force 588 N."
  ],
  answer: 2,
  why: "$F_N = m(g + a_y)$ with $a_y = -2.0$ gives $60 \\times 7.8 = 468$ N. The gravitational force is $mg = 588$ N and has not changed — the lift cannot alter Earth's pull, only the floor's push.",
  whyNot: [
    "The scale reading is right, but the gravitational force is not what the scale reads. Confusing the two is the whole trap here.",
    "708 N is the *upward*-accelerating case; downwards makes you lighter, not heavier.",
    "588 N would be the reading only with no vertical acceleration."
  ]
},
{
  id: "qz-dyn-normal-apparent-weight-02",
  conceptId: "dyn-normal-apparent-weight",
  source: "CED 2.6",
  stem: "An astronaut floats inside an orbiting station. What is the correct account?",
  options: [
    "Gravity is negligible at that altitude, so nothing pulls the astronaut down.",
    "Gravity is cancelled by the centrifugal force of the orbit.",
    "The astronaut is beyond Earth's gravitational field, which ends at the atmosphere.",
    "Gravity is the only force acting; there is no normal force because everything nearby is falling together."
  ],
  answer: 3,
  why: "Apparent weight is the normal force, and in free fall it is zero. Gravity is very much still acting — it is what keeps the station in orbit instead of moving off in a straight line.",
  whyNot: [
    "At the station's altitude the field strength is around 90% of its surface value. Negligible is not what it is.",
    "There is no centrifugal force in an inertial frame; gravity is the unbalanced force that supplies the centripetal requirement.",
    "A gravitational field has no edge, and the atmosphere is not a boundary for it."
  ]
},
{
  id: "qz-dyn-normal-apparent-weight-03",
  conceptId: "dyn-normal-apparent-weight",
  source: "CED 2.6",
  stem: "Which expression for the normal force goes with which situation?",
  options: [
    "$F_N = mg\\cos\\theta$ for a rope pulling upwards at angle $\\theta$.",
    "$F_N = mg - T\\sin\\theta$ for a rope pulling upwards at angle $\\theta$ with tension $T$.",
    "$F_N = mg + T\\sin\\theta$ for a rope pulling upwards at angle $\\theta$ with tension $T$.",
    "$F_N = mg$ whenever the floor is horizontal."
  ],
  answer: 1,
  why: "There is no list to memorise, only one method: write the perpendicular equation. An upward pull takes part of the load off the floor, so the normal force falls by the pull's vertical component.",
  whyNot: [
    "$mg\\cos\\theta$ is the incline case, where the angle tilts the *surface* rather than the rope.",
    "Adding the vertical component would describe a rope pressing the object down, not lifting it.",
    "A horizontal floor is not enough: an angled pull, an extra push or a vertical acceleration each breaks this."
  ]
},
{
  id: "qz-dyn-normal-apparent-weight-04",
  conceptId: "dyn-normal-apparent-weight",
  source: "CED 2.6",
  stem: "Why does an error in the normal force matter more than it first appears in friction problems?",
  options: [
    "Because friction is $\\mu F_N$, so any error in $F_N$ is carried straight into the friction force.",
    "Because the normal force appears in the equation for $\\mu$, which then changes units.",
    "Because friction acts perpendicular to the normal force, so the two are independent.",
    "Because the normal force is the third-law partner of friction."
  ],
  answer: 0,
  why: "Friction inherits whatever the normal force got wrong, which is why the perpendicular equation is worth writing carefully before anything is multiplied by $\\mu$.",
  whyNot: [
    "$\\mu$ is a dimensionless ratio and does not acquire units when $F_N$ is miscalculated — the error shows up in the force instead, where it is harder to see.",
    "They are perpendicular, but not independent: the friction *magnitude* is set by the normal force.",
    "The partner of the normal force is the object's push on the surface, not friction."
  ]
},

{
  id: "qz-dyn-kinetic-friction-01",
  conceptId: "dyn-kinetic-friction",
  source: "CED 2.7",
  stem: "A box sits on a conveyor belt that starts moving forwards and speeds up under it, so the box slides backwards relative to the belt. Which way does friction act on the box?",
  options: [
    "Backwards, since friction always opposes motion.",
    "Forwards — friction opposes the sliding of the surfaces past each other, and the box slides backwards relative to the belt.",
    "There is no friction, because the box is not being pushed.",
    "Downwards, adding to the box's weight."
  ],
  answer: 1,
  why: "The careful statement is ‘opposite to the relative motion of the surfaces’, not ‘opposite to the motion’. Here the belt moves forwards under the box, so friction drags the box forwards — and it is the only horizontal force that can accelerate it.",
  whyNot: [
    "Friction is not by nature retarding. It resists sliding, and which way that points depends on which surface is moving relative to which.",
    "Friction needs relative sliding and a normal force, both of which are present. An applied push is not required.",
    "Friction acts along the surfaces, parallel to them; the perpendicular contact force is the normal force."
  ]
},
{
  id: "qz-dyn-kinetic-friction-02",
  conceptId: "dyn-kinetic-friction",
  source: "CED 2.7",
  stem: "A 12 kg crate is pushed horizontally at constant velocity across a level floor with $\\mu_k = 0.35$. What push is required? Use $g = 9.8$ m/s$^2$.",
  options: [
    "4.2 N",
    "118 N",
    "41 N",
    "34 N"
  ],
  answer: 2,
  why: "Constant velocity means the push balances friction: $\\mu_k mg = 0.35 \\times 117.6 \\approx 41$ N. The normal force here is $mg$ because the push is horizontal and the floor is level.",
  whyNot: [
    "4.2 N is $\\mu_k m$ with the $g$ left out — a units check catches it, since that expression is in kilograms.",
    "118 N is $mg$ itself, the full weight, which would be the answer only if $\\mu_k$ were 1.",
    "34 N would follow from $\\mu_k mg\\cos\\theta$ with some tilt, but this floor is level."
  ]
},
{
  id: "qz-dyn-kinetic-friction-03",
  conceptId: "dyn-kinetic-friction",
  source: "CED 2.7",
  stem: "Kinetic friction on a block sliding down a ramp of angle $\\theta$ has magnitude —",
  options: [
    "$\\mu_k mg$",
    "$\\mu_k mg\\sin\\theta$",
    "$\\mu_k mg\\cos\\theta$",
    "$\\mu_k m a$"
  ],
  answer: 2,
  why: "Friction is $\\mu_k F_N$, and on a ramp the perpendicular equation gives $F_N = mg\\cos\\theta$. Find the normal force first, then multiply — in every friction problem, without exception.",
  whyNot: [
    "$\\mu_k mg$ assumes a horizontal surface and overstates the friction for every non-zero tilt.",
    "$mg\\sin\\theta$ is the component of gravity *along* the slope — the force driving the block down, not the normal force.",
    "Friction does not depend on the object's acceleration; the acceleration is what you solve for once friction is known."
  ]
},
{
  id: "qz-dyn-kinetic-friction-04",
  conceptId: "dyn-kinetic-friction",
  source: "CED 2.7",
  stem: "The equation sheet prints only $|\\vec{F}_f| \\le |\\mu\\vec{F}_N|$. What must you supply yourself?",
  options: [
    "That $\\mu$ is dimensionless.",
    "That kinetic friction is an equality, $|\\vec{F}_{f,k}| = \\mu_k|\\vec{F}_N|$",
    "That friction depends on the contact area, which the sheet omits.",
    "That friction increases with sliding speed at high speeds."
  ],
  answer: 1,
  why: "The sheet gives one unlabelled $\\mu$ and one inequality. The distinction between the static ceiling and the kinetic equality is not printed anywhere, and using the wrong one is the most common way to lose marks in this topic.",
  whyNot: [
    "It is worth knowing, but it is a consequence of the equation as printed — a ratio of two forces — rather than something the sheet leaves out.",
    "Friction in this model does *not* depend on contact area: a brick dragged on its face or its edge feels the same friction.",
    "The model treats kinetic friction as independent of sliding speed."
  ]
},

{
  id: "qz-dyn-static-friction-01",
  conceptId: "dyn-static-friction",
  source: "CED 2.7",
  stem: "An 8.0 kg box on a level floor has $\\mu_s = 0.50$. A horizontal force of 30 N is applied and the box does not move. What is the friction force on it? Use $g = 9.8$ m/s$^2$.",
  options: [
    "39 N",
    "30 N",
    "9.2 N",
    "0.50 N"
  ],
  answer: 1,
  why: "Below the threshold, static friction takes whatever value keeps the box in equilibrium — here exactly 30 N, opposing the push. The $\\mu_s F_N = 39$ N figure only tells you whether that was possible.",
  whyNot: [
    "39 N is the maximum static friction, which is reached only in the instant before slipping. Assuming friction is always at its maximum is the standard error.",
    "9.2 N is the difference between the maximum and the applied force, which corresponds to nothing physical.",
    "0.50 is the coefficient — a dimensionless ratio, not a force."
  ]
},
{
  id: "qz-dyn-static-friction-02",
  conceptId: "dyn-static-friction",
  source: "CED 2.7",
  stem: "The same 8.0 kg box, now with $\\mu_s = 0.50$ and $\\mu_k = 0.30$, is pushed with 45 N. What is the friction force and the acceleration?",
  options: [
    "Friction 45 N; acceleration zero, since the box stays in equilibrium.",
    "Friction 39 N; acceleration 0.73 m/s$^2$.",
    "Friction 23.5 N; acceleration about 2.7 m/s$^2$.",
    "Friction 23.5 N; acceleration about 5.6 m/s$^2$."
  ],
  answer: 2,
  why: "45 N exceeds the 39 N ceiling, so the box slips and friction switches to the kinetic value $\\mu_k mg = 23.5$ N. Then $a = \\frac{45 - 23.5}{8.0} \\approx 2.7$ m/s$^2$.",
  whyNot: [
    "Static friction cannot exceed its maximum. Once the applied force passes 39 N, equilibrium is no longer available.",
    "This keeps using $\\mu_s$ after the box has started sliding — the mirror of the previous error, and the reason friction drops discontinuously at the moment of slipping.",
    "5.6 m/s$^2$ is $\\frac{45}{8.0}$, the acceleration with friction dropped from the equation entirely."
  ]
},
{
  id: "qz-dyn-static-friction-03",
  conceptId: "dyn-static-friction",
  source: "CED 2.7",
  stem: "A car accelerates forwards on a dry road without wheelspin. What friction acts on the driving wheels, and in what direction?",
  options: [
    "Kinetic friction, backwards, opposing the car's motion.",
    "Kinetic friction, forwards, because the tyre surface moves backwards.",
    "No friction, since the contact patch is not sliding.",
    "Static friction, forwards"
  ],
  answer: 3,
  why: "Rolling without slipping means the contact patch is not sliding, so the friction is static however fast the car is going. Its direction is whatever prevents slipping — here forwards, which is the only external force that can accelerate the car.",
  whyNot: [
    "Kinetic friction requires the surfaces to slide over each other, which is exactly what ‘without wheelspin’ rules out.",
    "The direction is right and the type is wrong, and the type matters: $\\mu_s$ is typically larger, which is why traction is lost once a wheel spins.",
    "Static friction acts with no sliding at all — indeed it is the force that keeps the sliding from starting."
  ]
},
{
  id: "qz-dyn-static-friction-04",
  conceptId: "dyn-static-friction",
  source: "CED 2.7",
  stem: "A block on a ramp begins to slip when the ramp is tilted to angle $\\theta$. What is $\\mu_s$, and why does the block's mass not appear?",
  options: [
    "$\\mu_s = \\tan\\theta$, and the mass cancels because it multiplies both $mg\\sin\\theta$ and $\\mu_s mg\\cos\\theta$.",
    "$\\mu_s = \\sin\\theta$, and the mass cancels because friction does not depend on weight.",
    "$\\mu_s = \\cos\\theta$, and the mass cancels because the normal force is independent of mass.",
    "$\\mu_s$ cannot be found without the mass, since heavier blocks slip at smaller angles."
  ],
  answer: 0,
  why: "At the point of slipping $mg\\sin\\theta = \\mu_s mg\\cos\\theta$, and dividing gives $\\tan\\theta = \\mu_s$. Every block of the same material slips at the same angle, which makes this a neat way to measure $\\mu_s$ with a ruler and a protractor.",
  whyNot: [
    "The sine alone would come from setting the driving force equal to $\\mu_s mg$, that is, from using the wrong normal force. And friction does depend on weight — through $F_N$.",
    "The cosine inverts the ratio, and the normal force very much does depend on mass.",
    "Heavier blocks slip at the *same* angle: more weight means more driving force and proportionally more friction."
  ]
},

{
  id: "qz-dyn-spring-force-01",
  conceptId: "dyn-spring-force",
  source: "CED 2.8",
  stem: "A relaxed spring is 0.30 m long. Loaded, it measures 0.38 m. What is $\\Delta x$ in Hooke's law?",
  options: [
    "0.38 m",
    "0.08 m",
    "0.68 m",
    "0.30 m"
  ],
  answer: 1,
  why: "$\\Delta x$ is the change from the relaxed length, so $0.38 - 0.30 = 0.08$ m. Using the total length is the most common error here and inflates $k$ by a factor of nearly five.",
  whyNot: [
    "0.38 m is the loaded length. A spring at its relaxed length would then be claimed to exert a force.",
    "0.68 m is the two lengths added, which corresponds to nothing.",
    "0.30 m is the relaxed length, at which the spring force is zero by definition."
  ]
},
{
  id: "qz-dyn-spring-force-02",
  conceptId: "dyn-spring-force",
  source: "CED 2.8",
  stem: "A 0.25 kg mass hangs at rest from a spring and stretches it 0.080 m. What is the spring constant? Use $g = 9.8$ m/s$^2$.",
  options: [
    "0.031 N/m",
    "2.0 N/m",
    "31 N/m",
    "310 N/m"
  ],
  answer: 2,
  why: "At rest the spring force balances gravity: $k = \\frac{mg}{\\Delta x} = \\frac{2.45}{0.080} \\approx 31$ N/m. The equilibrium condition is what makes this measurement work, and it fails the moment the mass is accelerating.",
  whyNot: [
    "0.031 N/m inverts the fraction, giving $\\Delta x / mg$. The units come out m/N.",
    "2.0 N/m divides by the mass rather than the extension.",
    "310 N/m is out by a factor of ten — the sort of slip a quick check catches, since 31 N/m stretched 0.08 m gives back 2.5 N, about the weight."
  ]
},
{
  id: "qz-dyn-spring-force-03",
  conceptId: "dyn-spring-force",
  source: "CED 2.8",
  stem: "You hang known masses from a spring, measure each extension, and want $k$. Why take the gradient of the force–extension graph rather than one point's ratio?",
  options: [
    "Because the gradient uses every data point and survives a systematic zero error in the ruler",
    "Because a single point gives $k$ in the wrong units.",
    "Because the relationship between force and extension is not linear.",
    "Because the gradient gives $1/k$, which is easier to compare between springs."
  ],
  answer: 0,
  why: "A ratio assumes the line passes exactly through the origin; a gradient does not. That is the difference between a method that a mis-set ruler ruins and one it does not touch.",
  whyNot: [
    "A ratio of newtons to metres gives N/m either way. Units are not the issue.",
    "For an ideal spring over its working range the relationship is linear — which is why a straight-line fit is the right tool.",
    "The gradient of force against extension is $k$ itself, not its reciprocal."
  ]
},
{
  id: "qz-dyn-spring-force-04",
  conceptId: "dyn-spring-force",
  source: "CED 2.8",
  stem: "What does the minus sign in $\\vec{F}_s = -k\\Delta\\vec{x}$ mean?",
  options: [
    "That $k$ is negative for a compressed spring.",
    "That the spring loses energy as it is stretched.",
    "That the force opposes the displacement, always pointing back towards the equilibrium position.",
    "That the force is measured downwards, since springs are usually hung vertically."
  ],
  answer: 2,
  why: "Stretched, it pulls back; compressed, it pushes back. The sign encodes that direction — and it belongs to the vector statement, so a magnitude calculation should use $F_s = k|\\Delta x|$ with the direction put in from the diagram.",
  whyNot: [
    "$k$ is a positive property of the spring in every case. A negative $k$ is a sure sign the minus sign was carried into a magnitude.",
    "An ideal spring stores energy as it is stretched and gives it back; nothing is lost.",
    "The equation holds for any orientation, and the sign is about direction relative to the displacement, not about which way is down."
  ]
},

{
  id: "qz-dyn-circular-motion-01",
  conceptId: "dyn-circular-motion",
  source: "CED 2.9",
  stem: "Should ‘centripetal force’ be drawn as an arrow on a free-body diagram for a ball on a string moving in a horizontal circle?",
  options: [
    "Yes, pointing towards the centre, alongside the tension.",
    "Yes, and an outward centrifugal arrow to balance it.",
    "No — centripetal is a role played by the tension, so drawing it as well counts one force twice.",
    "No — the correct arrow to draw is the centrifugal one, pointing outwards."
  ],
  answer: 2,
  why: "$mv^2/r$ is not a force but a requirement: it is what the net inward force must equal. The tension is the force that meets that requirement, and adding a second inward arrow makes the forces on the diagram fail to sum correctly.",
  whyNot: [
    "This is the double count. The tension *is* the centripetal force in this situation.",
    "There is no centrifugal force in an inertial frame, and adding it to a correct diagram would produce zero net force on an object that is plainly accelerating.",
    "An outward force would push the ball away from the centre; what it actually needs is a net force towards the centre."
  ]
},
{
  id: "qz-dyn-circular-motion-02",
  conceptId: "dyn-circular-motion",
  source: "CED 2.9",
  stem: "A 1200 kg car rounds a flat unbanked bend of radius 50 m with $\\mu_s = 0.60$. What is its maximum speed, and would a heavier car manage more? Use $g = 9.8$ m/s$^2$.",
  options: [
    "About 17 m/s, and a heavier car could go no faster, because the mass cancels.",
    "About 17 m/s, and a heavier car could go faster, because it has more friction available.",
    "About 30 m/s, and mass is irrelevant.",
    "About 8.6 m/s, and a heavier car could go faster."
  ],
  answer: 0,
  why: "$\\mu_s mg = \\frac{mv^2}{r}$ gives $v = \\sqrt{\\mu_s g r} = \\sqrt{294} \\approx 17$ m/s. Mass appears on both sides and cancels: more mass brings more available friction and exactly as much more inertia to steer.",
  whyNot: [
    "More friction is available, but a heavier car also needs a proportionally larger inward force. The two effects cancel exactly.",
    "30 m/s would need $\\mu_s g r \\approx 900$, roughly three times what these numbers give.",
    "8.6 m/s is half the correct value — the sort of result a dropped factor produces; and the mass conclusion is wrong as well."
  ]
},
{
  id: "qz-dyn-circular-motion-03",
  conceptId: "dyn-circular-motion",
  source: "CED 2.9",
  stem: "What is the minimum speed for an object to maintain contact at the top of a vertical circular loop of radius $r$?",
  options: [
    "Zero, provided the track pushes hard enough.",
    "$\\sqrt{2gr}$, from energy conservation over the loop.",
    "$gr$, so that the weight equals the centripetal requirement.",
    "$\\sqrt{gr}$, the speed at which gravity alone supplies the whole centripetal requirement."
  ],
  answer: 3,
  why: "At the top, gravity points towards the centre. The limiting case is the normal force falling to zero, leaving $mg = \\frac{mv^2}{r}$, so $v = \\sqrt{gr}$. Any slower and the object leaves the track.",
  whyNot: [
    "At the top the track can only push inwards — downwards — so it cannot hold a stationary object up there.",
    "$\\sqrt{2gr}$ is an energy result for a different question, such as a speed gained falling through a height $r$.",
    "$gr$ has the units of a velocity squared, not a velocity, which is the quickest way to spot it."
  ]
},
{
  id: "qz-dyn-circular-motion-04",
  conceptId: "dyn-circular-motion",
  source: "CED 2.9",
  stem: "Which of these circular-motion relations is printed on the AP equation sheet?",
  options: [
    "$a_c = \\frac{v^2}{r}$",
    "$T = \\frac{2\\pi r}{v}$",
    "$v = \\sqrt{gr}$ for the top of a loop",
    "$T^2 = \\frac{4\\pi^2}{GM}R^3$"
  ],
  answer: 0,
  why: "$a_c = v^2/r$ is on the sheet, and so is $T = 1/f$. Everything else in this concept is derived: one circumference at constant speed, or one line from the second law.",
  whyNot: [
    "It is one line from ‘distance is a circumference and speed is constant’, but it is not printed.",
    "This is derived from $mg = mv^2/r$ at the limiting case, and is not on the sheet.",
    "Kepler's third law in this form is derived, is not printed, and Kepler's first and second laws are not in the course at all."
  ]
},

/* ---- Unit 3 · Work, energy, and power ------------------------------------ */

{
  id: "qz-enr-energy-and-systems-01",
  conceptId: "enr-energy-and-systems",
  source: "CED 3.4",
  stem: "A 2.0 kg book slides across a level table at 3.0 m/s and stops after 1.5 m against a 6.0 N friction force. Which pair of accounts is correct?",
  options: [
    "Book alone: 9.0 J transferred out by an external force. Book plus table: 9.0 J converted to thermal energy inside the system.",
    "Book alone: 9.0 J destroyed. Book plus table: 9.0 J transferred out across the boundary.",
    "Book alone: energy conserved, so nothing changes. Book plus table: 9.0 J converted to thermal energy.",
    "Both systems: 9.0 J transferred out, because friction is external in either case."
  ],
  answer: 0,
  why: "Same 9.0 J, two descriptions. With the table outside, friction is an external force doing $-9.0$ J of work; with the table inside, that interaction is internal and the mechanical energy becomes thermal energy without crossing any boundary.",
  whyNot: [
    "Energy is never destroyed. Mechanical energy left the account, and the whole point of the second system choice is to say where it went.",
    "The book alone does change: its kinetic energy falls from 9.0 J to zero, because an external force did negative work on it.",
    "Whether friction is external depends entirely on where the boundary is. Once the table is inside, the rubbing surfaces are both inside."
  ]
},
{
  id: "qz-enr-energy-and-systems-02",
  conceptId: "enr-energy-and-systems",
  source: "CED 3.4",
  stem: "Under what conditions is a system's total mechanical energy constant?",
  options: [
    "Whenever no external force acts on it.",
    "Whenever the system is isolated from gravity.",
    "When no net work is done on it from outside **and** there are no non-conservative interactions inside it.",
    "Always, since energy is conserved in all interactions."
  ],
  answer: 2,
  why: "Both halves are required, and each rules out a different failure. External work moves energy across the boundary; internal dissipation converts mechanical energy to thermal energy without any boundary being crossed.",
  whyNot: [
    "An external force that does no work — a normal force on a sliding block — is harmless. It is work, not force, that moves energy.",
    "Gravity inside the system is fine: it is conservative, and its effect is carried by a potential energy term.",
    "Energy is conserved in all interactions, but *mechanical* energy is not. Conflating the two is what makes people apply $E_i = E_f$ to a sliding block."
  ]
},
{
  id: "qz-enr-energy-and-systems-03",
  conceptId: "enr-energy-and-systems",
  source: "CED 3.4",
  stem: "Why not always take ‘everything in the universe’ as the system, so that the energy is guaranteed constant?",
  options: [
    "Because the total energy of the universe is not in fact constant.",
    "Because external work would then be impossible to define.",
    "Because AP Physics 1 forbids systems containing more than two objects.",
    "Because it is true but useless"
  ],
  answer: 3,
  why: "A good boundary is big enough to make the interesting interaction internal and small enough that every remaining term can be computed. ‘Everything’ satisfies the first and fails the second.",
  whyNot: [
    "It is constant — that is the fact being exploited. The problem is that the statement stops being useful.",
    "External work is well defined and simply equals zero, which is exactly the trouble: the equation becomes true and empty.",
    "Systems of many objects are entirely legitimate; only the centre-of-mass calculation is capped at five particles."
  ]
},
{
  id: "qz-enr-energy-and-systems-04",
  conceptId: "enr-energy-and-systems",
  source: "CED 3.4",
  stem: "What kinds of energy can a system containing exactly one object have?",
  options: [
    "Kinetic energy only.",
    "Kinetic and gravitational potential energy.",
    "Kinetic and elastic potential energy.",
    "Any kind, since energy is a property of objects."
  ],
  answer: 0,
  why: "Potential energy is stored in the *arrangement* of two or more objects interacting through a conservative force. One object has no arrangement, so it can carry only the energy of its own motion.",
  whyNot: [
    "Gravitational potential energy belongs to the object-and-Earth system. If the Earth is outside your boundary, gravity is an external force doing work instead.",
    "Elastic potential energy belongs to the object-and-spring system, for exactly the same reason.",
    "Potential energy is a property of a system, never of a single object — which is why naming the pair is the safe habit."
  ]
},

{
  id: "qz-enr-kinetic-energy-01",
  conceptId: "enr-kinetic-energy",
  source: "CED 3.1",
  stem: "A car's speed triples with no change in mass. By what factor does its kinetic energy change?",
  options: [
    "3",
    "6",
    "9",
    "$\\sqrt{3}$"
  ],
  answer: 2,
  why: "$K \\propto v^2$, so tripling the speed multiplies the energy by $3^2 = 9$. The ratio method needs neither the mass nor the factor of $\\frac{1}{2}$ — everything else cancels.",
  whyNot: [
    "A factor of 3 would follow if $K$ were proportional to $v$, which is momentum's behaviour, not energy's.",
    "6 is $2 \\times 3$ and corresponds to no operation on this formula.",
    "The square root inverts the relationship; energy grows faster than speed, not more slowly."
  ]
},
{
  id: "qz-enr-kinetic-energy-02",
  conceptId: "enr-kinetic-energy",
  source: "CED 3.1",
  stem: "Two identical cars travel at 20 m/s, one east and one west. Compare their kinetic energies.",
  options: [
    "Equal, because kinetic energy is a scalar built on speed.",
    "Equal in magnitude but opposite in sign.",
    "Different, because their velocities have opposite signs.",
    "The comparison is undefined without choosing a positive direction."
  ],
  answer: 0,
  why: "The $v$ in $K = \\frac{1}{2}mv^2$ is a speed, and squaring removes any sign in any case. Kinetic energy has no direction and is never negative.",
  whyNot: [
    "There is no such thing as negative kinetic energy. Signs live on *work*, which can take energy out.",
    "The velocities differ; the energies do not, because the square discards the sign.",
    "The choice of positive direction affects the velocity components and cannot affect a scalar built from their squares."
  ]
},
{
  id: "qz-enr-kinetic-energy-03",
  conceptId: "enr-kinetic-energy",
  source: "CED 3.1",
  stem: "Two observers in different inertial frames measure different kinetic energies for the same object. What follows?",
  options: [
    "One of them has made an error, since energy is conserved.",
    "Nothing is wrong: they measure different speeds",
    "Only the observer at rest relative to the ground is correct.",
    "Kinetic energy is frame-independent, so the situation cannot arise."
  ],
  answer: 1,
  why: "Kinetic energy is built on the speed measured in the observer's own frame, and different frames measure different speeds. Conservation holds within each frame; it does not require the two to agree on a value.",
  whyNot: [
    "Conservation says energy does not change over time in a given frame. It says nothing about frames agreeing with each other.",
    "No inertial frame is privileged. The ground frame is convenient, not correct.",
    "It is acceleration that is frame-independent between inertial frames. Speed, and therefore kinetic energy, is not."
  ]
},
{
  id: "qz-enr-kinetic-energy-04",
  conceptId: "enr-kinetic-energy",
  source: "CED 3.1",
  stem: "A car doubles its speed. Under the same constant braking force, what happens to its stopping distance?",
  options: [
    "It doubles, because the car is going twice as fast.",
    "It stays the same, because the braking force is unchanged.",
    "It quadruples, because the kinetic energy to be removed is four times larger.",
    "It increases by $\\sqrt{2}$, because energy goes as the square root of distance."
  ],
  answer: 2,
  why: "The brakes remove energy at a fixed rate per metre, so the distance is proportional to the kinetic energy — and that has gone up by a factor of four. This is the quadratic dependence showing up as a road-safety fact.",
  whyNot: [
    "Doubling would be right if the energy went as $v$. It goes as $v^2$, which is why speed limits matter more than they look.",
    "A constant force over a longer distance does more work; the force being unchanged is what makes the distance grow.",
    "The relation is the other way round: energy is proportional to distance here, and to the square of speed."
  ]
},

{
  id: "qz-enr-work-definition-01",
  conceptId: "enr-work-definition",
  source: "CED 3.2",
  stem: "You hold a heavy box motionless at arm's length for a minute. How much work do you do **on the box**?",
  options: [
    "Zero, because there is no displacement.",
    "$mgh$, where $h$ is the height at which you hold it.",
    "It depends on how tired you become.",
    "Enough to equal the box's potential energy, delivered each second."
  ],
  answer: 0,
  why: "Work needs a force *and* a displacement of its point of application. Your muscles consume chemical energy holding the box, but none of it is transferred to the box, whose energy does not change at all.",
  whyNot: [
    "$mgh$ is the work you did lifting the box to that height, which is over. Holding it there adds nothing.",
    "Effort is a fact about your physiology, not about energy transferred to the box. A shelf holds the box with no effort and does the same zero work.",
    "Potential energy is not consumed by being held; nothing is being delivered."
  ]
},
{
  id: "qz-enr-work-definition-02",
  conceptId: "enr-work-definition",
  source: "CED 3.2",
  stem: "In $W = Fd\\cos\\theta$, whose displacement is $d$?",
  options: [
    "The displacement of the system's centre of mass, always.",
    "The displacement of the point at which the force is exerted.",
    "The total distance travelled along the path.",
    "The displacement of the object exerting the force."
  ],
  answer: 1,
  why: "The CED is careful about this. For a block sliding on a table the two coincide, and then the system may be modelled as one object whose kinetic energy is the only thing that can change. For a person crouching and jumping they differ — the floor's normal force acts at a point that never moves, so the floor does no work at all.",
  whyNot: [
    "It coincides with the centre-of-mass displacement in the simple case, and the jumper is the standard counterexample.",
    "Path length appears in the friction model, not in the definition of work by a constant force.",
    "What the pusher's body does is irrelevant; what matters is the point where the force is applied."
  ]
},
{
  id: "qz-enr-work-definition-03",
  conceptId: "enr-work-definition",
  source: "CED 3.2",
  stem: "A 50 N horizontal force pushes a 12 kg crate 4.0 m along a frictionless horizontal floor, starting from rest. What is the work done by each force, and the final kinetic energy?",
  options: [
    "Push $+200$ J, gravity $+470$ J, normal force $-470$ J; kinetic energy 200 J.",
    "Push $+200$ J, gravity 0, normal force 0; kinetic energy 0, since the floor is frictionless.",
    "Push $+600$ J, gravity 0, normal force 0; kinetic energy 600 J.",
    "Push $+200$ J, gravity 0, normal force 0; kinetic energy 200 J."
  ],
  answer: 3,
  why: "Only the push has a component along the displacement: $50 \\times 4.0 = 200$ J. Gravity and the normal force are both perpendicular to the motion, so each does zero work, and the work-energy theorem hands the whole 200 J to the crate's kinetic energy.",
  whyNot: [
    "Gravity and the normal force are perpendicular to a horizontal displacement, so neither does work — and they would cancel in any case.",
    "Frictionless means nothing removes the energy, so the kinetic energy is the full 200 J rather than zero.",
    "600 J would need a displacement of 12 m, or a force of 150 N."
  ]
},
{
  id: "qz-enr-work-definition-04",
  conceptId: "enr-work-definition",
  source: "CED 3.2",
  stem: "You carry a suitcase horizontally across a room at constant speed. How much work does your upward carrying force do on it?",
  options: [
    "Zero, because the force is perpendicular to the displacement.",
    "Positive, because you are moving the suitcase.",
    "Negative, because you are resisting gravity.",
    "$mgd$, where $d$ is the width of the room."
  ],
  answer: 0,
  why: "Your force is vertical and the displacement is horizontal, so $\\cos 90° = 0$. This is the same reason the normal force does no work on a sliding block — and it is why ‘effort’ and ‘work’ are different words here.",
  whyNot: [
    "Moving it is not sufficient; the force must have a component *along* the movement.",
    "Negative work would mean the suitcase loses energy to you, which it does not — its energy is unchanged.",
    "$mgd$ multiplies a vertical force by a horizontal distance, which the cosine is there to prevent."
  ]
},

{
  id: "qz-enr-work-angle-and-sign-01",
  conceptId: "enr-work-angle-and-sign",
  source: "CED 3.2",
  stem: "A ball on a string is whirled in a horizontal circle at constant speed. How much work does the tension do over one revolution, and why?",
  options: [
    "Positive work, because the tension is what keeps the ball moving.",
    "Zero, because the tension is perpendicular to the velocity at every instant.",
    "Zero, because the ball returns to where it started.",
    "Negative work, because the tension points opposite to where the ball is going."
  ],
  answer: 1,
  why: "A perpendicular force does no work, so it cannot change the kinetic energy, so it cannot change the speed. That is exactly how a force can change the direction of motion and nothing else — the reason a satellite in a circular orbit keeps its speed forever.",
  whyNot: [
    "Nothing is needed to keep the ball moving; the tension is needed to keep it turning.",
    "The round trip gives the right answer for the wrong reason — this argument works for a conservative force, and tension is not one. Here the work is zero over *every* stretch of the path, not just a complete loop.",
    "The tension points towards the centre, which is perpendicular to the velocity, not opposite to it."
  ]
},
{
  id: "qz-enr-work-angle-and-sign-02",
  conceptId: "enr-work-angle-and-sign",
  source: "CED 3.2",
  stem: "A crate is dragged 4.0 m across a level floor by a rope pulling 50 N at 37° above the horizontal, against 20 N of friction. What is the net work on the crate? ($\\cos 37° = 4/5$.)",
  options: [
    "$+120$ J",
    "$+200$ J",
    "$+80$ J",
    "$+240$ J"
  ],
  answer: 2,
  why: "Rope: $50 \\times 4.0 \\times 0.8 = +160$ J. Friction: $-80$ J. Gravity and the normal force: zero each, being perpendicular to the displacement. Net $= +80$ J, which is the rise in kinetic energy.",
  whyNot: [
    "120 J comes from using the full 50 N for the rope and then subtracting friction — the angle has been dropped.",
    "200 J is the rope's work at full strength with friction ignored entirely.",
    "240 J adds the friction work instead of subtracting it, and uses the unresolved tension."
  ]
},
{
  id: "qz-enr-work-angle-and-sign-03",
  conceptId: "enr-work-angle-and-sign",
  source: "CED 3.2",
  stem: "Which angle belongs in $W = Fd\\cos\\theta$?",
  options: [
    "The angle between the force and the horizontal.",
    "The angle between the force and the surface.",
    "The angle of the incline.",
    "The angle between the force and the displacement."
  ],
  answer: 3,
  why: "On a ramp these are all different, and using the angle to the ground is the single commonest way a work calculation fails. Ask what angle the force arrow makes with the arrow showing where the object actually went.",
  whyNot: [
    "The horizontal is only the right reference when the displacement happens to be horizontal.",
    "The surface and the displacement coincide for sliding along a plane, but not for a projectile or a lift.",
    "The incline's angle appears when resolving gravity, which is a different step."
  ]
},
{
  id: "qz-enr-work-angle-and-sign-04",
  conceptId: "enr-work-angle-and-sign",
  source: "CED 3.2",
  stem: "How can you get the sign of a force's work without evaluating any cosine?",
  options: [
    "Ask whether the force has a component along the motion (positive), opposite it (negative), or neither (zero).",
    "Ask whether the force is a contact force (positive) or a non-contact force (negative).",
    "Ask whether the object is speeding up (positive) or slowing down (negative).",
    "Ask whether the force is larger or smaller than the object's weight."
  ],
  answer: 0,
  why: "Helping means positive, opposing means negative, exactly perpendicular means zero. It is worth having because it catches the standard double-negative error — inserting a minus sign for friction *and* using $\\cos 180°$, which quietly cancels back to positive.",
  whyNot: [
    "The type of force says nothing about sign: gravity does positive work on a falling object and negative work on a rising one.",
    "That gives the sign of the *net* work. An individual force can do negative work while the object speeds up, if another force does more positive work.",
    "Magnitude has no bearing on sign, which is entirely a question of direction."
  ]
},

{
  id: "qz-enr-work-from-graph-01",
  conceptId: "enr-work-from-graph",
  source: "CED 3.2",
  stem: "A force along the direction of motion rises linearly from 0 N at $x = 0$ to 12 N at $x = 3.0$ m, then holds at 12 N to $x = 5.0$ m. How much work does it do over the 5.0 m?",
  options: [
    "42 J",
    "60 J",
    "30 J",
    "24 J"
  ],
  answer: 0,
  why: "Split at the kink: a triangle of $\\frac{1}{2} \\times 3.0 \\times 12 = 18$ J, plus a rectangle of $2.0 \\times 12 = 24$ J, giving 42 J. Every straight-segment graph reduces to those two shapes.",
  whyNot: [
    "60 J is $12 \\times 5.0$ — the whole region treated as a rectangle, which ignores that the force starts at zero.",
    "30 J is $12 \\times 5.0 / 2$, treating the whole region as a triangle instead.",
    "24 J is the rectangle alone, with the ramp left out."
  ]
},
{
  id: "qz-enr-work-from-graph-02",
  conceptId: "enr-work-from-graph",
  source: "CED 3.2",
  stem: "On a graph of force against position, what does the **slope** represent?",
  options: [
    "The work done.",
    "The power delivered.",
    "A spring constant, in N/m",
    "The kinetic energy gained."
  ],
  answer: 2,
  why: "Multiply the axis units to see which is which: N $\\times$ m is a joule, so work is the *area*; N $\\div$ m is N/m, which is a stiffness. When you cannot remember, the units decide it in a second.",
  whyNot: [
    "Work is the area. Taking the slope instead is the standard error on this graph.",
    "Power is energy per unit *time*, and there is no time axis here.",
    "Kinetic energy gained equals the net work, so it too is an area."
  ]
},
{
  id: "qz-enr-work-from-graph-03",
  conceptId: "enr-work-from-graph",
  source: "CED 3.2",
  stem: "Where does the $\\frac{1}{2}$ in $U_s = \\frac{1}{2}k(\\Delta x)^2$ come from?",
  options: [
    "From averaging the initial and final spring constants.",
    "From the triangle: Hooke's law makes the force rise linearly from 0 to $k\\Delta x$",
    "From the fact that half the energy is stored and half is dissipated.",
    "It is a convention, chosen so that the units come out in joules."
  ],
  answer: 1,
  why: "The spring's force is not constant, so the work is an area rather than a product — and the area under a straight line from the origin is a triangle. Knowing this means the formula can never be confused with a rectangular $k(\\Delta x)^2$.",
  whyNot: [
    "$k$ is a constant of the spring and does not change as it stretches.",
    "An ideal spring dissipates nothing; all the stored energy is recoverable.",
    "The units work out from $k$ in N/m times m$^2$ regardless of the factor, so the $\\frac{1}{2}$ is doing physical work, not bookkeeping."
  ]
},
{
  id: "qz-enr-work-from-graph-04",
  conceptId: "enr-work-from-graph",
  source: "CED 3.2",
  stem: "What is the area under a force-versus-**time** graph?",
  options: [
    "Work, in joules.",
    "Power, in watts.",
    "Kinetic energy, in joules.",
    "Impulse, in N$\\cdot$s."
  ],
  answer: 3,
  why: "Read the axes before reading the shape. N $\\times$ s is an impulse, which changes momentum; work needs a force multiplied by a distance. The two graphs look identical and answer different questions.",
  whyNot: [
    "Work requires a displacement on the horizontal axis, not a time.",
    "Power is a rate, so it would be a slope of an energy graph, not this area.",
    "Kinetic energy changes by the work done, which is not what this area gives."
  ]
},

{
  id: "qz-enr-work-energy-theorem-01",
  conceptId: "enr-work-energy-theorem",
  source: "CED 3.2",
  stem: "A 1500 kg car travelling at 20 m/s brakes to rest in 40 m. What is the magnitude of the constant braking force?",
  options: [
    "7500 N",
    "750 N",
    "15000 N",
    "3750 N"
  ],
  answer: 0,
  why: "Backwards use of the theorem: $\\Delta K = -\\frac{1}{2}(1500)(20)^2 = -3.0 \\times 10^5$ J, and $W = -Fd$, so $F = \\frac{3.0 \\times 10^5}{40} = 7500$ N. Quicker than finding the acceleration first, and it never needs the time.",
  whyNot: [
    "750 N is out by a factor of ten.",
    "15000 N drops the factor of $\\frac{1}{2}$ from the kinetic energy.",
    "3750 N halves the answer, as though the energy were $\\frac{1}{4}mv^2$."
  ]
},
{
  id: "qz-enr-work-energy-theorem-02",
  conceptId: "enr-work-energy-theorem",
  source: "CED 3.2",
  stem: "Why does $\\Delta K = \\sum W$ solve problems where $v^2 = v_0^2 + 2a\\Delta x$ cannot?",
  options: [
    "Because it includes potential energy, which kinematics omits.",
    "Because it applies to curved paths, while kinematics applies only to straight ones.",
    "Because the kinematics equation requires constant acceleration",
    "Because it works in non-inertial frames."
  ],
  answer: 2,
  why: "The theorem asks only how much energy went in, and an area under a force-displacement graph supplies that whether the force is constant, ramped or curved. Constant acceleration is a condition the kinematics equation cannot do without.",
  whyNot: [
    "The work-energy theorem is a statement about kinetic energy alone; potential energy is the next step, not part of it.",
    "Kinematics handles curved paths perfectly well when resolved onto axes — projectile motion is the standard case.",
    "Neither relation is designed for non-inertial frames, and the exam assumes inertial ones."
  ]
},
{
  id: "qz-enr-work-energy-theorem-03",
  conceptId: "enr-work-energy-theorem",
  source: "CED 3.2",
  stem: "A rope hauls a crate up a rough ramp. Which works belong in $\\Delta K = \\sum W$?",
  options: [
    "The rope's only, since it is the force doing the hauling.",
    "The rope's and friction's, but not gravity's, which is balanced by the normal force.",
    "The rope's, gravity's and friction's; the normal force contributes zero.",
    "All four, including the normal force, which does negative work on a ramp."
  ],
  answer: 2,
  why: "The theorem sums over *all* forces acting. Gravity has a component down the slope and does negative work; friction does negative work; the normal force is perpendicular to the motion and does none.",
  whyNot: [
    "Using only the force the question is about is the standard error here.",
    "Gravity is not balanced by the normal force on a ramp — the normal force balances only the perpendicular component of gravity.",
    "The normal force is perpendicular to the displacement at every point, so its work is zero, not negative."
  ]
},
{
  id: "qz-enr-work-energy-theorem-04",
  conceptId: "enr-work-energy-theorem",
  source: "CED 3.2",
  stem: "What in the wording of a problem signals that energy methods will beat kinematics?",
  options: [
    "It gives speeds and distances but never mentions time",
    "It gives an acceleration and asks for a final velocity.",
    "It mentions more than one object.",
    "It asks for a direction rather than a magnitude."
  ],
  answer: 0,
  why: "Time does not appear anywhere in $\\Delta K = \\sum W$, so a problem that never mentions it is not withholding anything. A curved track or a spring settles it, because then kinematics has no constant acceleration to work with.",
  whyNot: [
    "A stated constant acceleration is exactly the case kinematics handles best.",
    "Number of objects decides the system choice, not which method to use.",
    "Energy is a scalar, so a question about direction is a hint the other way."
  ]
},

{
  id: "qz-enr-conservative-forces-01",
  conceptId: "enr-conservative-forces",
  source: "CED 3.2",
  stem: "Why does friction fail the closed-loop test for a conservative force?",
  options: [
    "Because it converts mechanical energy into thermal energy, and energy is therefore not conserved.",
    "Because it reverses direction when the motion reverses, so it does negative work on both legs and the round trip totals $-2F_fd$.",
    "Because its magnitude changes with speed, so the outward and return works differ.",
    "Because it acts only while the object is moving, and a closed loop ends at rest."
  ],
  answer: 1,
  why: "Gravity gives back on the way down what it took on the way up; friction never gets the chance, because it flips direction along with the motion and so opposes both legs.",
  whyNot: [
    "Energy is conserved in all interactions. What friction destroys is *mechanical* energy, and that is a different claim.",
    "In this model kinetic friction does not depend on speed at all.",
    "A closed loop is about returning to the initial configuration, not about ending at rest — and friction acts throughout the journey either way."
  ]
},
{
  id: "qz-enr-conservative-forces-02",
  conceptId: "enr-conservative-forces",
  source: "CED 3.2",
  stem: "You move a 2.0 kg book from the floor to a shelf 1.0 m up. Path A goes straight up. Path B goes up 2.0 m and back down 1.0 m. How much work does gravity do along each? Use $g = 9.8$ m/s$^2$.",
  options: [
    "$-19.6$ J along A, $-29.4$ J along B.",
    "$-19.6$ J along A, $-58.8$ J along B.",
    "$-19.6$ J along both, because only the height change counts.",
    "Zero along both, because the book ends at rest."
  ],
  answer: 2,
  why: "Gravity is conservative, so its work depends only on the initial and final configurations. Path B's extra metre up is exactly undone by the metre back down, and the totals are identical.",
  whyNot: [
    "This adds the up-leg and ignores that the down-leg returns the energy — the two extra metres cancel.",
    "This counts the whole 3.0 m of travel as though gravity opposed all of it.",
    "Gravity's work has nothing to do with the book's final speed; it is $-mg\\Delta y$ whether the book is placed gently or thrown."
  ]
},
{
  id: "qz-enr-conservative-forces-03",
  conceptId: "enr-conservative-forces",
  source: "CED 3.2",
  stem: "Why is there no such thing as ‘friction potential energy’?",
  options: [
    "Because friction is too small to store useful amounts of energy.",
    "Because thermal energy is not a form of potential energy.",
    "Because friction acts only on surfaces, and potential energy needs a field.",
    "Because a potential energy is a number determined by configuration alone"
  ],
  answer: 3,
  why: "Potential energies exist only for conservative forces. If the energy ‘stored’ depended on which route you took, it would not be a function of the configuration, and the whole idea of $U$ would fail.",
  whyNot: [
    "Magnitude is irrelevant; a very large friction force still has no potential energy.",
    "True but beside the point — the reason is path dependence, not the form the energy ends up in.",
    "Contact forces can be conservative: an ideal spring is one."
  ]
},
{
  id: "qz-enr-conservative-forces-04",
  conceptId: "enr-conservative-forces",
  source: "CED 3.2",
  stem: "A student defines a conservative force as ‘one that conserves energy’. What is wrong with that?",
  options: [
    "Nothing — that is the definition.",
    "Every force conserves energy; a conservative force conserves *mechanical* energy by storing it rather than dissipating it.",
    "Conservative forces do not conserve energy; they convert it.",
    "The definition should refer to momentum rather than energy."
  ],
  answer: 1,
  why: "Energy is conserved in all interactions, so the loose definition picks out nothing at all. The meaningful claim is the narrower one, and its operational form is the closed-loop test.",
  whyNot: [
    "It sounds like a definition and excludes no force, which is what makes it useless.",
    "Conservative forces do conserve energy — as does everything else.",
    "Momentum conservation is a separate principle with its own condition, and it is not what ‘conservative’ names."
  ]
},

{
  id: "qz-enr-potential-energy-system-01",
  conceptId: "enr-potential-energy-system",
  source: "CED 3.3",
  stem: "Who decides where gravitational potential energy is zero, and why is that allowed?",
  options: [
    "The problem does, by naming the ground; any other choice is an error.",
    "Nature does: $U = 0$ at the Earth's surface.",
    "You do, to make the analysis easier",
    "Nobody: potential energy is always measured from the object's starting position."
  ],
  answer: 2,
  why: "A constant added to every value of $U$ cancels in every difference, so the physical predictions cannot depend on the choice. That is why the equation sheet prints $\\Delta U_g = mg\\Delta y$ as a change rather than as an absolute.",
  whyNot: [
    "The ground is often convenient and never compulsory. A tabletop zero is perfectly legitimate.",
    "The general form puts the zero at infinite separation, which is a different convention again — evidence that no location is nature's own.",
    "Starting position is one possible choice among many, and it makes the initial $U$ zero rather than being required."
  ]
},
{
  id: "qz-enr-potential-energy-system-02",
  conceptId: "enr-potential-energy-system",
  source: "CED 3.3",
  stem: "A 3.0 kg ball sits 1.2 m above the floor. Taking the zero at the tabletop instead of the floor, what are the initial and final gravitational potential energies as it falls, and what does that change?",
  options: [
    "0 J then $-35.28$ J; nothing changes, since $\\Delta U$ is the same either way.",
    "35.28 J then 0 J; the landing speed comes out larger.",
    "0 J then $+35.28$ J; the ball gains potential energy as it falls.",
    "The choice is illegal, because potential energy cannot be negative."
  ],
  answer: 0,
  why: "With the zero at the tabletop the ball starts at $U = 0$ and ends below it, at $-35.28$ J. $\\Delta U = -35.28$ J either way, and the landing speed is 4.85 m/s under both choices.",
  whyNot: [
    "Those are the values for a zero at the *floor*, and no choice of zero can change a speed.",
    "Falling means moving towards lower potential energy, so the value must decrease.",
    "A negative $U$ simply means ‘below the level I called zero’, and is entirely legitimate."
  ]
},
{
  id: "qz-enr-potential-energy-system-03",
  conceptId: "enr-potential-energy-system",
  source: "CED 3.3",
  stem: "Whose property is potential energy?",
  options: [
    "The object's, since it is what moves.",
    "The field's, since that is where it is stored.",
    "The system's — it is stored in the arrangement of two or more objects interacting conservatively.",
    "The observer's, since the zero point is chosen."
  ],
  answer: 2,
  why: "The safe habit is to name the pair every time: the ball-Earth system, the block-spring system. A question that asks you to identify a system's energies, or why a lone object cannot have potential energy, is testing exactly this.",
  whyNot: [
    "‘The object has potential energy’ usually passes unremarked and is wrong for a reason the exam sometimes asks about directly.",
    "Fields are the Physics 2 way of describing where energy sits; in this course the potential energy belongs to the interacting pair.",
    "The observer chooses the zero, which is a different matter from what carries the energy."
  ]
},
{
  id: "qz-enr-potential-energy-system-04",
  conceptId: "enr-potential-energy-system",
  source: "CED 3.3",
  stem: "For a system of three objects interacting through conservative forces, how is the total potential energy found?",
  options: [
    "As the sum over each pair",
    "As the sum over each object's own potential energy.",
    "By taking the largest of the three pairwise values.",
    "By multiplying the pairwise energies together."
  ],
  answer: 0,
  why: "Potential energy is stored in an interaction, and each interaction involves two objects. Three objects have three distinct pairs, and each contributes once.",
  whyNot: [
    "An individual object has no potential energy of its own; the whole point is that it takes two.",
    "Every pair stores energy, so ignoring two of them loses real terms.",
    "Energies add; nothing here is multiplicative."
  ]
},

{
  id: "qz-enr-gravitational-pe-01",
  conceptId: "enr-gravitational-pe",
  source: "CED 3.3",
  stem: "A ball slides 1.5 m along a curved ramp while dropping 0.80 m vertically. Which distance goes into $\\Delta U_g$?",
  options: [
    "1.5 m, the distance actually travelled.",
    "0.80 m, the vertical drop.",
    "The average of the two, since the path is curved.",
    "Neither — a curved path requires the general form $U_G = -Gm_1m_2/r$."
  ],
  answer: 1,
  why: "Gravity is conservative, so its work depends only on the height change. The 1.5 m would matter only for a friction term, where path length is what counts.",
  whyNot: [
    "Path length is the friction distance. Using it here would make a gentle ramp store more energy than a steep one to the same height.",
    "There is nothing to average: the vertical drop is exact.",
    "The general form is for problems where $g$ changes appreciably, which is not the case over 0.80 m."
  ]
},
{
  id: "qz-enr-gravitational-pe-02",
  conceptId: "enr-gravitational-pe",
  source: "CED 3.3",
  stem: "Why is $U_G = -\\frac{Gm_1m_2}{r}$ negative?",
  options: [
    "Because gravity is an attractive force, and attractive forces carry negative energy.",
    "Because the objects are losing energy as they approach.",
    "Because the zero has been placed at infinite separation, so every finite separation lies below it.",
    "Because the equation applies only to bound systems, which have negative total energy."
  ],
  answer: 2,
  why: "It is the same convention as everywhere else in the course — a chosen zero — picked because there is no floor to stand on when the objects are planets. Only differences are physical, exactly as for the near-surface form.",
  whyNot: [
    "Attraction is why the energy *decreases* with decreasing separation, but the sign of $U$ itself comes from where zero was put.",
    "Nothing is lost as they approach: gravitational potential energy converts to kinetic energy within the system.",
    "The expression applies to unbound pairs too; boundedness is about the *total* energy, not about this term."
  ]
},
{
  id: "qz-enr-gravitational-pe-03",
  conceptId: "enr-gravitational-pe",
  source: "CED 3.3",
  stem: "When is $\\Delta U_g = mg\\Delta y$ a valid substitute for the general form?",
  options: [
    "Whenever the object is inside a planet's atmosphere.",
    "Whenever the object is not accelerating.",
    "Whenever the object moves vertically rather than along a slope.",
    "When the height change is small enough that the field strength $g$ is effectively constant over it."
  ],
  answer: 3,
  why: "Constant force times distance gives an energy linear in height. Close to a surface the field is near enough uniform for that; far out, $g$ falls off and you need $U_G = -Gm_1m_2/r$.",
  whyNot: [
    "The atmosphere is not the criterion — a satellite just above it is well outside the approximation, and the approximation holds fine in a vacuum chamber.",
    "Acceleration is irrelevant; the approximation is about how much $g$ varies over the journey.",
    "The path shape does not matter at all, which is precisely the advantage of a conservative force."
  ]
},
{
  id: "qz-enr-gravitational-pe-04",
  conceptId: "enr-gravitational-pe",
  source: "CED 3.3",
  stem: "A 0.20 kg ball rolls without friction down a ramp, dropping 0.80 m. What is its speed at the bottom if it started at rest? Use $g = 9.8$ m/s$^2$.",
  options: [
    "3.96 m/s",
    "1.57 m/s",
    "7.84 m/s",
    "15.7 m/s"
  ],
  answer: 0,
  why: "$v = \\sqrt{2g\\Delta y} = \\sqrt{15.68} = 3.96$ m/s. The mass cancels, so the 0.20 kg is there to let you compute $\\Delta U_g = -1.57$ J if the question asks for it.",
  whyNot: [
    "1.57 is the *energy* in joules, not a speed. The units are the giveaway.",
    "7.84 is $2g\\Delta y / 2$ or similar — in any case the square root has not been taken.",
    "15.7 is $2g\\Delta y$, the value under the root."
  ]
},

{
  id: "qz-enr-elastic-pe-01",
  conceptId: "enr-elastic-pe",
  source: "CED 3.3",
  stem: "A spring is compressed twice as far. By what factor does its stored energy increase?",
  options: [
    "2",
    "4",
    "8",
    "$\\sqrt{2}$"
  ],
  answer: 1,
  why: "$U_s = \\frac{1}{2}k(\\Delta x)^2$, so doubling $\\Delta x$ multiplies the energy by four. The launch speed it can give a cart therefore only doubles, since $K \\propto v^2$ as well.",
  whyNot: [
    "A factor of 2 would follow if the energy were linear in the compression, which is the force's behaviour, not the energy's.",
    "8 would be a cube dependence, which nothing here has.",
    "The square root inverts the relation."
  ]
},
{
  id: "qz-enr-elastic-pe-02",
  conceptId: "enr-elastic-pe",
  source: "CED 3.3",
  stem: "A spring already compressed 0.05 m is compressed a further 0.07 m. What $\\Delta x$ goes into $U_s$ at the end?",
  options: [
    "0.07 m, the further compression.",
    "0.02 m, the difference.",
    "0.12 m, measured from the spring's natural length.",
    "0.035 m, the average."
  ],
  answer: 2,
  why: "$\\Delta x$ is always measured from the natural, unstretched length — not from the floor, not from where the block was, and not from wherever the spring happened to be at the start of the problem.",
  whyNot: [
    "The further compression gives the *change* in position, not the deformation from natural length.",
    "0.02 m is a subtraction with no physical meaning here.",
    "Averaging two compressions produces neither state's energy."
  ]
},
{
  id: "qz-enr-elastic-pe-03",
  conceptId: "enr-elastic-pe",
  source: "CED 3.3",
  stem: "A spring goes from compression $\\Delta x_i$ to compression $\\Delta x_f$. How much energy is released?",
  options: [
    "$\\frac{1}{2}k(\\Delta x_i - \\Delta x_f)^2$",
    "$\\frac{1}{2}k(\\Delta x_i)^2 - \\frac{1}{2}k(\\Delta x_f)^2$",
    "$\\frac{1}{2}k(\\Delta x_i^2 + \\Delta x_f^2)$",
    "$k(\\Delta x_i - \\Delta x_f)$"
  ],
  answer: 1,
  why: "Square each displacement first, then subtract. Subtracting the displacements and squaring afterwards is a genuinely common way to lose the mark, and it gives a plausible-looking number.",
  whyNot: [
    "This subtracts before squaring, which is not the same operation — try it with $\\Delta x_i = 0.2$ and $\\Delta x_f = 0.1$ and the two differ by a factor of three.",
    "Adding the two energies describes no process at all.",
    "This is a force expression, not an energy: the units are newtons."
  ]
},
{
  id: "qz-enr-elastic-pe-04",
  conceptId: "enr-elastic-pe",
  source: "CED 3.3",
  stem: "Does a spring store more energy when stretched or when compressed by the same distance?",
  options: [
    "Stretched, because the coils separate.",
    "Compressed, because the coils resist being closed up.",
    "The same, because $\\Delta x$ is squared.",
    "It depends on the spring constant."
  ],
  answer: 2,
  why: "Squaring removes the sign of the deformation, so an ideal spring stores $\\frac{1}{2}k(\\Delta x)^2$ either way. ‘Ideal’ is doing real work here: the exam's conventions assume it unless told otherwise.",
  whyNot: [
    "Real springs do behave differently at large deformations, but the ideal model the course uses does not.",
    "Same objection — the model is symmetric about the natural length.",
    "$k$ scales both cases equally and cannot break the symmetry."
  ]
},

{
  id: "qz-enr-mechanical-energy-conservation-01",
  conceptId: "enr-mechanical-energy-conservation",
  source: "CED 3.4",
  stem: "A 50 kg skateboarder starts from rest at the top of a smooth curved ramp 2.5 m high. What is the speed at the bottom? Use $g = 9.8$ m/s$^2$.",
  options: [
    "7.0 m/s",
    "24.5 m/s",
    "49 m/s",
    "It cannot be found without the shape of the ramp."
  ],
  answer: 0,
  why: "$v = \\sqrt{2gh} = \\sqrt{49} = 7.0$ m/s. The mass cancels and the shape never enters: gravitational potential energy depends only on the height, and the normal force is perpendicular to the motion everywhere, so it does no work.",
  whyNot: [
    "24.5 is $\\frac{1}{2}gh \\times 2$ — in any case the square root has not been taken.",
    "49 is $2gh$, the value under the root.",
    "The shape would matter for kinematics, which needs the acceleration along the path. Energy needs only the endpoints."
  ]
},
{
  id: "qz-enr-mechanical-energy-conservation-02",
  conceptId: "enr-mechanical-energy-conservation",
  source: "CED 3.4",
  stem: "Which of these is printed on the AP equation sheet?",
  options: [
    "$E = K + U$",
    "$K_i + U_i = K_f + U_f$",
    "$K_i + U_i = K_f + U_f + E_{\\text{dissipated}}$",
    "$U_s = \\frac{1}{2}k(\\Delta x)^2$"
  ],
  answer: 3,
  why: "You are handed the individual energy formulas — $K$, $\\Delta U_g$, $U_s$ — and $\\Delta K = \\sum W$. The conservation statement itself is something you assemble, which is worth knowing before exam day rather than during it.",
  whyNot: [
    "The definition of mechanical energy is not printed.",
    "The conservation equation is not printed either.",
    "Nor is the dissipative extension."
  ]
},
{
  id: "qz-enr-mechanical-energy-conservation-03",
  conceptId: "enr-mechanical-energy-conservation",
  source: "CED 3.4",
  stem: "Why does mass cancel from $v = \\sqrt{2gh}$ for a frictionless slide from rest?",
  options: [
    "Because gravity acts equally on all objects regardless of mass.",
    "Because both the potential energy released and the kinetic energy gained are proportional to $m$.",
    "Because the normal force scales with mass and cancels the difference.",
    "Because the slide is frictionless, and friction is the only mass-dependent force."
  ],
  answer: 1,
  why: "$mgh = \\frac{1}{2}mv^2$ has an $m$ on both sides, so it divides out. A 20 kg child and a 50 kg adult reach the bottom of the same ramp at the same speed.",
  whyNot: [
    "The gravitational *force* is proportional to mass, not equal for all objects; it is the acceleration that is shared.",
    "The normal force does no work at all, so it cannot cancel anything in the energy equation.",
    "Friction is proportional to the normal force and so to mass — which is why mass still cancels on a rough ramp for the friction term too."
  ]
},
{
  id: "qz-enr-mechanical-energy-conservation-04",
  conceptId: "enr-mechanical-energy-conservation",
  source: "CED 3.4",
  stem: "Which step of a conservation-of-energy solution comes **before** writing any energy terms?",
  options: [
    "Solving for the unknown speed symbolically.",
    "Converting all heights to metres.",
    "Defining the system, choosing the zero of $U_g$",
    "Computing the acceleration along the path."
  ],
  answer: 2,
  why: "The terms you are entitled to write depend on where the boundary is and where zero is. Deciding those afterwards is how the same problem ends up with gravity counted twice, or heights measured from two different levels.",
  whyNot: [
    "Solving comes last, once both sides are written.",
    "Units matter, but they are housekeeping rather than the modelling decision.",
    "The acceleration along a curved path is exactly what energy methods avoid needing."
  ]
},

{
  id: "qz-enr-system-bookkeeping-01",
  conceptId: "enr-system-bookkeeping",
  source: "CED 3.4",
  stem: "In an energy solution, how may gravity appear?",
  options: [
    "As an external force doing work, or as a gravitational potential energy",
    "As both, since the two describe different aspects of the same interaction.",
    "Only as a potential energy, since gravity is conservative.",
    "Only as a force doing work, since potential energy belongs to springs."
  ],
  answer: 0,
  why: "Which one applies is decided by the boundary. Object alone: gravity is external, does work, and there is no $U_g$. Object plus Earth: gravity is internal, does no work, and the energy lives in $U_g$. There is no third arrangement.",
  whyNot: [
    "Writing both counts the same energy twice — the error this concept exists to prevent.",
    "The single-object system is a perfectly legitimate choice, and there gravity does work.",
    "Gravitational potential energy is standard; springs are the second example, not the only one."
  ]
},
{
  id: "qz-enr-system-bookkeeping-02",
  conceptId: "enr-system-bookkeeping",
  source: "CED 3.4",
  stem: "On a fall from rest, what is the numerical fingerprint of counting gravity twice?",
  options: [
    "The energy comes out half as large, so the speed is 71% of the correct value.",
    "The energy comes out exactly twice too large",
    "The energy is correct but the direction of the velocity is reversed.",
    "The answer is dimensionally wrong, so it is caught by a units check."
  ],
  answer: 1,
  why: "Both routes contribute the same $mgh$, so the total energy doubles and the speed rises by $\\sqrt{2}$. On the 2.5 m ramp, 7.0 m/s becomes 9.9 m/s — a plausible-looking number, which is what makes the check worth knowing.",
  whyNot: [
    "Halving is what you would get from omitting a term, not from double-counting one.",
    "Energy is a scalar and carries no direction to reverse.",
    "Both routes are dimensionally sound, which is exactly why units do not catch this."
  ]
},
{
  id: "qz-enr-system-bookkeeping-03",
  conceptId: "enr-system-bookkeeping",
  source: "CED 3.4",
  stem: "A block is launched by a spring. If you put the spring **inside** the system, what must you do?",
  options: [
    "Use $U_s = \\frac{1}{2}k(\\Delta x)^2$ and also add the work done by the spring force.",
    "Compute the work done by the spring as an area under its force-displacement graph, and write no $U_s$ term.",
    "Use $U_s = \\frac{1}{2}k(\\Delta x)^2$ and not compute the spring's work.",
    "Treat the spring force as external, since it acts on the block."
  ],
  answer: 2,
  why: "Same either-or as gravity. Inside means potential energy and no work term — and it is nearly always the easier choice, because $U_s$ is a formula while the work of a varying force is a geometry problem.",
  whyNot: [
    "That is the double count, in its spring form.",
    "This is the correct treatment for a spring *outside* the system, not inside it.",
    "Where a force acts does not decide whether it is external; the boundary does."
  ]
},
{
  id: "qz-enr-system-bookkeeping-04",
  conceptId: "enr-system-bookkeeping",
  source: "CED 3.4",
  stem: "Which habit makes the double-count essentially impossible?",
  options: [
    "Always choosing the object alone as the system.",
    "Always writing the potential energy terms first.",
    "Checking that the final answer is smaller than the initial energy.",
    "Writing the system boundary down and listing the external forces before writing any equation."
  ],
  answer: 3,
  why: "If gravity is on the external list it does work and there is no $U_g$; if it is not on the list, there is a $U_g$ and gravity does no work. The list settles it before there is anything to get wrong.",
  whyNot: [
    "The single-object choice is often the harder one, and the error is available in that framing too.",
    "Order of writing does not decide entitlement — the boundary does.",
    "A double-counted answer can easily satisfy that check, since both totals are positive."
  ]
},

{
  id: "qz-enr-dissipation-friction-01",
  conceptId: "enr-dissipation-friction",
  source: "CED 3.2",
  stem: "A block slides down a ramp with friction. Which distance goes into which term?",
  options: [
    "Vertical height into $\\Delta U_g$; slope length into $F_fL$.",
    "Slope length into $\\Delta U_g$; vertical height into $F_fL$.",
    "Slope length into both.",
    "Vertical height into both."
  ],
  answer: 0,
  why: "Gravity is conservative, so only the height change counts; friction is not, so it takes the whole path over which the surfaces rubbed. A problem that supplies both numbers is testing exactly this.",
  whyNot: [
    "This is the standard failure of an inclined-plane energy problem, with both terms wrong at once.",
    "Using the slope length for gravity would make a gentle ramp release more energy than a steep one to the same height.",
    "Using the height for friction would make a long shallow slide dissipate as little as a short steep one."
  ]
},
{
  id: "qz-enr-dissipation-friction-02",
  conceptId: "enr-dissipation-friction",
  source: "CED 3.2",
  stem: "A 4.0 kg box sliding at 8.0 m/s meets a constant 12 N friction force. What is its speed after 6.0 m?",
  options: [
    "6.0 m/s",
    "5.3 m/s",
    "2.0 m/s",
    "It stops before travelling 6.0 m."
  ],
  answer: 1,
  why: "$K_i = 128$ J, and $F_fd = 12 \\times 6.0 = 72$ J is dissipated, leaving 56 J. Then $v = \\sqrt{2 \\times 56 / 4.0} = 5.3$ m/s.",
  whyNot: [
    "6.0 m/s corresponds to 72 J of kinetic energy left, which is the amount dissipated rather than the amount remaining.",
    "2.0 m/s would leave only 8 J, implying 120 J dissipated over these 6.0 m.",
    "It would need 128 J of dissipation to stop, which at 12 N takes about 10.7 m."
  ]
},
{
  id: "qz-enr-dissipation-friction-03",
  conceptId: "enr-dissipation-friction",
  source: "CED 3.2",
  stem: "Why write the energy equation as $K_i + U_i = K_f + U_f + E_{\\text{dissipated}}$ rather than subtracting the dissipated term on the left?",
  options: [
    "Because the equation sheet prints it in that form.",
    "Because dissipated energy is negative, and the arrangement makes that explicit.",
    "Because putting the dissipated term on the final side as a positive amount means its sign never has to be decided.",
    "Because the left side must contain only initial quantities of a single type."
  ],
  answer: 2,
  why: "Getting that sign wrong is where these problems usually fail. Written this way the equation reads as a sentence — the mechanical energy you began with either survived as mechanical energy or was dissipated — and no sign judgement is required.",
  whyNot: [
    "Neither this equation nor the friction model is on the equation sheet.",
    "The dissipated energy is a positive amount of energy that left the mechanical account; calling it negative is the confusion being avoided.",
    "There is no such rule about what may sit on each side."
  ]
},
{
  id: "qz-enr-dissipation-friction-04",
  conceptId: "enr-dissipation-friction",
  source: "CED 3.2",
  stem: "What does AP Physics 1 expect you to say about dissipated energy — and what does it not?",
  options: [
    "That it is destroyed; calculating where it goes belongs to Physics 2.",
    "That it becomes thermal energy or sound — but not to calculate temperature rises or follow the heat, which is Physics 2.",
    "That it becomes thermal energy, and to compute the resulting temperature change of the surfaces.",
    "That it becomes potential energy stored in the deformed surfaces."
  ],
  answer: 1,
  why: "The boundary is firm: knowing that mechanical energy left and how much left is inside the course; thermodynamics is not.",
  whyNot: [
    "Nothing is destroyed. It left the mechanical account, not the universe — and calling it ‘lost’ is the habit the concept warns against.",
    "Temperature calculations are explicitly outside this course.",
    "Friction has no potential energy, because its work is path-dependent."
  ]
},

{
  id: "qz-enr-power-01",
  conceptId: "enr-power",
  source: "CED 3.5",
  stem: "A motor raises an 800 kg lift at a constant 1.5 m/s. What power does it deliver? Use $g = 9.8$ m/s$^2$.",
  options: [
    "1.2 kW",
    "5.2 kW",
    "11.8 kW",
    "7.8 kW"
  ],
  answer: 2,
  why: "At constant speed the cable tension equals the weight, $7840$ N, so $P = Fv = 7840 \\times 1.5 = 1.18 \\times 10^4$ W. The average over any stretch of the rise agrees, because the rate is constant.",
  whyNot: [
    "1.2 kW is out by a factor of ten.",
    "5.2 kW corresponds to a speed of about 0.67 m/s at the same tension.",
    "7.8 kW is $mg$ in kilonewtons read as a power — the numbers 7840 and 7.8 kW are easy to slide between."
  ]
},
{
  id: "qz-enr-power-02",
  conceptId: "enr-power",
  source: "CED 3.5",
  stem: "Why is a car's top speed set by its engine's power rather than by the force it can exert?",
  options: [
    "Because at top speed the driving force balances the drag",
    "Because force has no effect once the car is already moving.",
    "Because power is conserved and force is not.",
    "Because drag is independent of speed, so only power can change."
  ],
  answer: 0,
  why: "At top speed there is no acceleration, so the force is pinned to whatever the drag is; the only lever left is how much power is available to deliver it at that speed. The same relation explains why a car accelerates hardest at low speed — with $P$ capped, a small $v$ permits a large $F$.",
  whyNot: [
    "Force is exactly what accelerates the car at every speed; the point is that at top speed it is fixed by the drag.",
    "Power is not a conserved quantity at all.",
    "Drag rises steeply with speed, which is what makes the balance settle at a particular value."
  ]
},
{
  id: "qz-enr-power-03",
  conceptId: "enr-power",
  source: "CED 3.5",
  stem: "‘The motor supplies 11.8 kW of energy.’ What is wrong with this sentence?",
  options: [
    "Nothing — kilowatts are a unit of energy.",
    "The figure should be negative, since the motor consumes energy.",
    "A watt is a joule per second",
    "Energy should be quoted in newton-metres rather than watts."
  ],
  answer: 2,
  why: "Power and energy are different quantities, and the units say so. Over 10 s that motor supplies 118 kJ; the kilowatt figure alone names no amount of energy at all.",
  whyNot: [
    "Kilowatts measure power. The kilowatt-*hour* is the energy unit built from it, and the difference is the multiplication by a time.",
    "The motor delivers energy to the lift, so a positive figure is right; the error is the quantity, not the sign.",
    "Newton-metres and joules are the same unit, so that substitution changes nothing."
  ]
},
{
  id: "qz-enr-power-04",
  conceptId: "enr-power",
  source: "CED 3.5",
  stem: "When do average and instantaneous power agree?",
  options: [
    "Always, since both are defined as energy over time.",
    "When the rate of energy transfer is constant",
    "Whenever the force is constant, regardless of the speed.",
    "Only at the midpoint of the time interval."
  ],
  answer: 1,
  why: "A constant rate has nothing to average away. When the rate varies — a sprinter accelerating, a spring extending — the two differ, and you have to read which the question wants.",
  whyNot: [
    "The average is over an interval and the instantaneous value is at a moment; they coincide only under the constant-rate condition.",
    "$P = Fv$ shows that a constant force with a rising speed gives a rising power, so this is not sufficient.",
    "There is no general theorem putting the average at the midpoint."
  ]
},

/* ---- Unit 4 · Linear momentum -------------------------------------------- */

{
  id: "qz-mom-momentum-01",
  conceptId: "mom-momentum",
  source: "CED 4.1",
  stem: "A 2 kg cart moves east at 3 m/s and an identical cart moves west at 3 m/s. What is the total momentum of the pair?",
  options: [
    "12 kg$\\cdot$m/s",
    "6 kg$\\cdot$m/s eastwards",
    "Zero",
    "18 kg$\\cdot$m/s, since the carts are approaching each other"
  ],
  answer: 2,
  why: "Momentum is a vector, so the westward cart contributes $-6$ kg$\\cdot$m/s against the eastward $+6$. They cancel exactly.",
  whyNot: [
    "12 adds the magnitudes, which discards the only information that distinguishes the two carts.",
    "The two contributions are equal in size, so neither direction can win.",
    "‘Approaching’ is a fact about their relative motion, and relative motion is not what the total momentum measures."
  ]
},
{
  id: "qz-mom-momentum-02",
  conceptId: "mom-momentum",
  source: "CED 4.1",
  stem: "A 3.0 kg cart moves east at 4.0 m/s while a 4.0 kg cart moves north at 3.0 m/s. What is the total momentum of the two-cart system?",
  options: [
    "24 kg$\\cdot$m/s, north-east",
    "Zero, since the momenta are perpendicular",
    "12 kg$\\cdot$m/s, east",
    "About 17 kg$\\cdot$m/s, 45° north of east"
  ],
  answer: 3,
  why: "Each cart carries 12 kg$\\cdot$m/s, one east and one north. Perpendicular components add by Pythagoras: $\\sqrt{12^2 + 12^2} \\approx 17$ kg$\\cdot$m/s, at 45° because the components are equal.",
  whyNot: [
    "24 adds the two magnitudes as though they pointed the same way — an overestimate by $\\sqrt{2}$.",
    "Perpendicular vectors do not cancel; only opposite ones do.",
    "12 kg$\\cdot$m/s east is the first cart alone."
  ]
},
{
  id: "qz-mom-momentum-03",
  conceptId: "mom-momentum",
  source: "CED 4.1",
  stem: "Why is momentum's unit written as kg$\\cdot$m/s rather than given a name of its own?",
  options: [
    "Because it follows directly from multiplying a mass by a velocity",
    "Because momentum is not a fundamental quantity in AP Physics 1.",
    "Because it is identical to the joule.",
    "Because the SI system reserves names for scalars only."
  ],
  answer: 0,
  why: "The sheet names hertz, joule, kilogram, metre, newton, pascal, second and watt — and nothing for momentum. Its unit is simply the product of the two it is built from. It is worth noticing that N$\\cdot$s is dimensionally the same thing, which is what lets impulse be set equal to it.",
  whyNot: [
    "Momentum is one of the course's central quantities; having no named unit is a matter of convention.",
    "A joule is a N$\\cdot$m, a quite different combination.",
    "The newton and the watt are units of a vector-valued and a scalar quantity respectively, so that rule does not exist."
  ]
},
{
  id: "qz-mom-momentum-04",
  conceptId: "mom-momentum",
  source: "CED 4.1",
  stem: "How is the total momentum of a system found in two dimensions?",
  options: [
    "Add all the magnitudes, then resolve the total into components.",
    "Add the $x$ components to get $p_x$ and the $y$ components to get $p_y$ separately, then combine.",
    "Take the momentum of the fastest object, since the others contribute less.",
    "Multiply the total mass by the total speed."
  ],
  answer: 1,
  why: "The two component sums are independent, and that independence is what gives a collision two separate equations — one per direction. Only after summing each does $\\sqrt{p_x^2 + p_y^2}$ mean anything.",
  whyNot: [
    "Magnitudes lose direction, and once lost it cannot be recovered by resolving afterwards.",
    "Every object contributes, and a slow heavy one can dominate a fast light one.",
    "‘Total speed’ is not a defined quantity, and mass times a summed speed is not a vector sum."
  ]
},

{
  id: "qz-mom-impulse-01",
  conceptId: "mom-impulse",
  source: "CED 4.2",
  stem: "A net force on a ball rises linearly from 0 to 600 N over 0.020 s, then falls linearly back to 0 over the next 0.030 s. What impulse is delivered?",
  options: [
    "30 N$\\cdot$s",
    "15 N$\\cdot$s",
    "12 N$\\cdot$s",
    "600 N$\\cdot$s"
  ],
  answer: 1,
  why: "The impulse is the area under the graph: one triangle of total base 0.050 s and height 600 N, so $\\frac{1}{2}(0.050)(600) = 15$ N$\\cdot$s.",
  whyNot: [
    "30 N$\\cdot$s uses the peak force as though it acted for the whole interval — a rectangle where the graph draws a triangle, over by exactly a factor of two.",
    "12 N$\\cdot$s uses only one of the two straight segments.",
    "600 is the peak force in newtons, not an impulse; it has not been multiplied by a time at all."
  ]
},
{
  id: "qz-mom-impulse-02",
  conceptId: "mom-impulse",
  source: "CED 4.2",
  stem: "What exactly is the ‘average force’ in $\\vec{J} = \\vec{F}_{avg}\\Delta t$?",
  options: [
    "The mean of the largest and smallest forces during the interval.",
    "The force measured at the midpoint of the interval.",
    "The peak force, reduced by a shape factor for the pulse.",
    "The constant force that would deliver the same impulse over the same interval."
  ],
  answer: 3,
  why: "It is the height of the rectangle with the same area as the actual force-time curve. That is why it is never measured separately: you get it by dividing the impulse by the elapsed time.",
  whyNot: [
    "The largest and smallest values say nothing about how long the force spent near either.",
    "The midpoint value happens to be right for a symmetric triangle and wrong in general.",
    "There is no such factor to apply; the area does the work."
  ]
},
{
  id: "qz-mom-impulse-03",
  conceptId: "mom-impulse",
  source: "CED 4.2",
  stem: "A force-time graph encloses $+8$ N$\\cdot$s of area above the time axis and 3 N$\\cdot$s of area below it. What impulse has been delivered?",
  options: [
    "5 N$\\cdot$s",
    "11 N$\\cdot$s",
    "8 N$\\cdot$s, since impulse cannot be negative",
    "24 N$\\cdot$s"
  ],
  answer: 0,
  why: "Area is signed: below the axis the force points the other way and removes momentum. The net impulse is $8 - 3 = 5$ N$\\cdot$s.",
  whyNot: [
    "11 adds the magnitudes and so counts the reversed force as though it helped.",
    "Impulse is a vector and can perfectly well be negative along a chosen axis.",
    "24 multiplies the two areas, which corresponds to nothing."
  ]
},
{
  id: "qz-mom-impulse-04",
  conceptId: "mom-impulse",
  source: "CED 4.2",
  stem: "Why must impulse and momentum share a unit?",
  options: [
    "Because both are vectors.",
    "Because the impulse-momentum theorem sets them equal",
    "Because both are measured with a force sensor.",
    "They do not — N$\\cdot$s and kg$\\cdot$m/s are different units."
  ],
  answer: 1,
  why: "$\\vec{J} = \\Delta\\vec{p}$ can only be written if the two sides have the same dimensions. N$\\cdot$s $=$ (kg$\\cdot$m/s$^2$)$\\cdot$s $=$ kg$\\cdot$m/s, and checking that is a fast way to catch a mis-set-up equation.",
  whyNot: [
    "Being vectors is not enough; force and velocity are both vectors with different units.",
    "How a quantity is measured has no bearing on its dimensions.",
    "They are the same unit written two ways, which is exactly the point."
  ]
},

{
  id: "qz-mom-impulse-momentum-theorem-01",
  conceptId: "mom-impulse-momentum-theorem",
  source: "CED 4.2",
  stem: "A 0.15 kg ball arrives at 30 m/s and leaves along the same line at 40 m/s in the opposite direction. What is the magnitude of its change in momentum?",
  options: [
    "1.5 kg$\\cdot$m/s",
    "6.0 kg$\\cdot$m/s",
    "4.5 kg$\\cdot$m/s",
    "10.5 kg$\\cdot$m/s"
  ],
  answer: 3,
  why: "Signed velocities: $+30$ becomes $-40$, so $\\Delta v = -70$ m/s and $|\\Delta p| = 0.15 \\times 70 = 10.5$ kg$\\cdot$m/s. The bat must both stop 30 m/s of incoming motion and create 40 m/s of outgoing motion, and those jobs add.",
  whyNot: [
    "1.5 subtracts the *speeds*, $0.15(40 - 30)$ — the most common wrong answer in the unit, and it appears whenever an object reverses.",
    "6.0 is the incoming momentum alone.",
    "4.5 is a mis-multiplication and satisfies neither state."
  ]
},
{
  id: "qz-mom-impulse-momentum-theorem-02",
  conceptId: "mom-impulse-momentum-theorem",
  source: "CED 4.2",
  stem: "On a graph of a system's momentum against time, what does the slope give?",
  options: [
    "The impulse delivered.",
    "The system's kinetic energy.",
    "The net external force on the system.",
    "The system's mass."
  ],
  answer: 2,
  why: "$\\vec{F}_{net} = \\Delta\\vec{p}/\\Delta t$ is a rate, so it is a slope. Area under a force-time graph and slope of a momentum-time graph are inverse readings of the same relationship, and questions cross between them deliberately.",
  whyNot: [
    "Impulse is the area under a *force*-time graph — and here it would be the change in height, not the slope.",
    "Kinetic energy cannot be read off a momentum graph without the mass.",
    "Mass relates momentum to velocity, and no velocity axis is present."
  ]
},
{
  id: "qz-mom-impulse-momentum-theorem-03",
  conceptId: "mom-impulse-momentum-theorem",
  source: "CED 4.2",
  stem: "Why does the equation sheet print $\\vec{F}_{net} = \\frac{\\Delta\\vec{p}}{\\Delta t} = m\\frac{\\Delta\\vec{v}}{\\Delta t} = m\\vec{a}$ as a chain?",
  options: [
    "Because the three expressions are alternatives and you may use whichever is convenient.",
    "Because the rate-of-momentum form is the more fundamental one",
    "Because $m\\vec{a}$ applies to single objects and the momentum form to systems.",
    "Because the momentum form is only valid at high speeds."
  ],
  answer: 1,
  why: "Net force equals the rate of change of momentum always; the step to $m\\vec{a}$ takes $m$ out of the rate, which needs $m$ to be constant. This course does not require quantitative work on systems whose mass changes, so the two coincide here — but knowing which is fundamental is what answers ‘why is the theorem stated in momentum at all’.",
  whyNot: [
    "They are numerically equal in this course but not equally general, and the chain is showing the derivation.",
    "Both forms apply to systems, with $\\vec{a}$ referring to the centre of mass.",
    "Nothing about speed enters; the condition is constant mass."
  ]
},
{
  id: "qz-mom-impulse-momentum-theorem-04",
  conceptId: "mom-impulse-momentum-theorem",
  source: "CED 4.2",
  stem: "A ball moving horizontally receives a purely horizontal impulse. What happens to its vertical momentum?",
  options: [
    "It increases, since the total momentum has increased.",
    "It reverses, since impulse always reverses momentum.",
    "It changes in proportion to the horizontal change.",
    "It is unchanged, because $\\vec{J} = \\Delta\\vec{p}$ holds separately in each direction."
  ],
  answer: 3,
  why: "The theorem is a vector equation, so $J_x = \\Delta p_x$ and $J_y = \\Delta p_y$ are independent statements. A horizontal impulse has no vertical component and therefore no vertical effect.",
  whyNot: [
    "The magnitude of the total may rise while the vertical component stays exactly where it was.",
    "Impulse reverses momentum only when it is large enough and opposite; direction is not automatic.",
    "There is no proportionality between perpendicular components — that is what independence means."
  ]
},

{
  id: "qz-mom-collision-time-01",
  conceptId: "mom-collision-time",
  source: "CED 4.2",
  stem: "A 70 kg driver travelling at 15 m/s is brought to rest. Against a rigid column the stop takes 0.10 s; with an airbag it takes 0.50 s. What does the airbag change?",
  options: [
    "The change in momentum, which falls from 1050 to 210 kg$\\cdot$m/s.",
    "The average force, which falls from about $1.05 \\times 10^4$ N to about $2.1 \\times 10^3$ N",
    "Both the impulse and the force, each by a factor of five.",
    "Neither: the driver's momentum change and the force are both fixed by the crash speed."
  ],
  answer: 1,
  why: "$\\Delta p$ is fixed by the initial speed and the final rest, so nothing inside the car can alter it. Stretching the time is the only lever available, and $F_{avg} = \\Delta p / \\Delta t$ then falls fivefold.",
  whyNot: [
    "Saying the airbag reduces the impulse hides the mechanism and is false: both cases start at 15 m/s and end at rest.",
    "The impulse is identical in the two cases — same area under the force-time graph, different shape.",
    "The force very much does change; that is what the airbag is for."
  ]
},
{
  id: "qz-mom-collision-time-02",
  conceptId: "mom-collision-time",
  source: "CED 4.2",
  stem: "Two force-time graphs describe the same crash, one with an airbag and one without. How do they compare?",
  options: [
    "The airbag graph encloses a smaller area.",
    "The airbag graph is taller and narrower.",
    "They enclose the same area; the airbag graph is shorter and wider.",
    "They are identical, since the collision is the same."
  ],
  answer: 2,
  why: "Equal areas because the impulse is fixed; different shapes because the time is not. That picture carries the whole idea, and it is the graphical form of $F_{avg} \\propto 1/\\Delta t$.",
  whyNot: [
    "A smaller area would mean a smaller momentum change, which the fixed initial and final velocities forbid.",
    "This is the no-airbag shape — tall and narrow is what a rigid column produces.",
    "The forces differ by a factor of five, so the graphs cannot be identical."
  ]
},
{
  id: "qz-mom-collision-time-03",
  conceptId: "mom-collision-time",
  source: "CED 4.2",
  stem: "Why does the concept warn that injury tracks the **peak** force rather than the average?",
  options: [
    "Because a device that bottoms out and then slams can deliver a spike even when the average is modest.",
    "Because the average force is not a real quantity.",
    "Because the peak force determines the impulse.",
    "Because peak and average differ only for very short collisions."
  ],
  answer: 0,
  why: "A protective device that spreads the force smoothly keeps the peak near the average, which is the design goal. Two devices can produce the same average and very different worst moments.",
  whyNot: [
    "The average is perfectly real — it is the height of the equivalent rectangle — it is simply not what injures.",
    "The impulse is the whole area; the peak is one point on the curve.",
    "They can differ by a large factor for any duration, depending on the shape of the pulse."
  ]
},
{
  id: "qz-mom-collision-time-04",
  conceptId: "mom-collision-time",
  source: "CED 4.2",
  stem: "Besides stretching the stopping time, what does a crumple zone necessarily also stretch?",
  options: [
    "The change in momentum.",
    "The stopping distance, which is why it must be long enough to crumple.",
    "The driver's kinetic energy, which rises with the longer stop.",
    "The mass of the system, since the crumpled metal is included."
  ],
  answer: 1,
  why: "A longer deceleration at a lower rate covers more ground. That is a design constraint, not a detail: a crumple zone with nowhere to crumple stops working.",
  whyNot: [
    "The momentum change is fixed by the speeds, which is the point of the whole concept.",
    "The kinetic energy to be removed is fixed by the crash speed too.",
    "The mass is the same metal before and after."
  ]
},

{
  id: "qz-mom-collisions-explosions-01",
  conceptId: "mom-collisions-explosions",
  source: "CED 4.1",
  stem: "‘There are no external forces during a collision, so momentum is conserved.’ What is the accurate version?",
  options: [
    "It is accurate as stated.",
    "Momentum is conserved because the collision is brief, so external forces have no time to act at all.",
    "The external impulse during the collision is negligible compared with the internal one",
    "Momentum is conserved because internal forces are equal and opposite, so no external condition is needed."
  ],
  answer: 2,
  why: "Gravity does not switch off. The claim that earns credit is quantitative: the external impulse over the interval is small compared with the internal one, which is why only the states immediately before and immediately after may be compared.",
  whyNot: [
    "It is simply false, and a justification built on a false premise is usually marked as such.",
    "External forces do act throughout; what is small is the impulse they deliver in that short time.",
    "Internal forces cancelling is necessary but not sufficient — a genuine net external force still changes the total."
  ]
},
{
  id: "qz-mom-collisions-explosions-02",
  conceptId: "mom-collisions-explosions",
  source: "CED 4.1",
  stem: "During a collision a 0.50 kg cart's velocity changes by 2.4 m/s in 0.0050 s, while the track exerts 0.30 N of friction on the pair. May this be modelled as a collision?",
  options: [
    "Yes: the internal force is about 240 N against an external 0.30 N",
    "No: any friction at all means momentum is not conserved.",
    "Yes, but only because the track is level.",
    "It cannot be decided without knowing the second cart's mass."
  ],
  answer: 0,
  why: "$F = m\\Delta v/\\Delta t = 0.50 \\times 2.4 / 0.0050 = 240$ N. That ratio is what justifies treating the total momentum as constant across the interaction, and quoting it is what turns an assumption into an argument.",
  whyNot: [
    "Friction is always present in a real experiment; the question is whether its impulse is negligible over the interval.",
    "Levelness affects whether gravity has a component along the track, but the argument here is about the size of the impulse.",
    "The internal force is computed from one cart's own momentum change, so the partner's mass is not needed."
  ]
},
{
  id: "qz-mom-collisions-explosions-03",
  conceptId: "mom-collisions-explosions",
  source: "CED 4.1",
  stem: "A stationary object explodes into exactly two pieces. What must be true afterwards?",
  options: [
    "The two pieces have equal speeds.",
    "The two pieces have equal and opposite momenta.",
    "The two pieces have equal kinetic energies.",
    "The heavier piece carries more momentum, in proportion to its mass."
  ],
  answer: 1,
  why: "The system started with zero total momentum and no net external force acted, so the pieces' momenta must still sum to zero. Equal magnitudes, opposite directions — and equal *speeds* only if the masses happen to match.",
  whyNot: [
    "Equal momenta with unequal masses means the lighter piece moves faster, often much faster.",
    "The lighter piece carries more kinetic energy, since $K = p^2/2m$ shares $p$ but divides by a smaller mass.",
    "Momentum magnitudes are equal regardless of the masses; it is the velocities that differ."
  ]
},
{
  id: "qz-mom-collisions-explosions-04",
  conceptId: "mom-collisions-explosions",
  source: "CED 4.1",
  stem: "Why do so many questions say ‘immediately after the collision’?",
  options: [
    "To indicate that the objects have not yet separated.",
    "Because the phrase is required whenever kinetic energy is lost.",
    "To restrict the interval to the one in which external impulse is negligible",
    "To signal that the collision was perfectly inelastic."
  ],
  answer: 2,
  why: "A cart that collides and then rolls for three seconds against friction has certainly lost momentum in those three seconds — but not during the collision. The phrase is the licence for the conservation step.",
  whyNot: [
    "Separation has usually already happened; the restriction is about time, not contact.",
    "The wording appears in elastic and inelastic problems alike.",
    "Stickiness is stated separately when it applies."
  ]
},

{
  id: "qz-mom-conservation-01",
  conceptId: "mom-conservation",
  source: "CED 4.3",
  stem: "Puck A, 2.0 kg, slides east at 3.0 m/s; puck B, 3.0 kg, slides north at 2.0 m/s. They collide and stick. What is their speed immediately afterwards?",
  options: [
    "2.4 m/s",
    "1.7 m/s",
    "1.2 m/s",
    "2.5 m/s"
  ],
  answer: 1,
  why: "Each puck carries 6.0 kg$\\cdot$m/s, one east and one north, so the total is $\\sqrt{6^2 + 6^2} \\approx 8.5$ kg$\\cdot$m/s. Divide by the combined 5.0 kg: about 1.7 m/s, at 45° north of east.",
  whyNot: [
    "2.4 m/s comes from adding the perpendicular momenta arithmetically, $6.0 + 6.0 = 12$ — too large by a factor of $\\sqrt{2}$.",
    "1.2 m/s is the eastward component of the final velocity, not its magnitude.",
    "2.5 m/s matches no combination of these numbers."
  ]
},
{
  id: "qz-mom-conservation-02",
  conceptId: "mom-conservation",
  source: "CED 4.3",
  stem: "Why is momentum conserved in a collision even when kinetic energy is not?",
  options: [
    "Because momentum is a vector and kinetic energy is a scalar.",
    "Because third-law force pairs act for the same time",
    "Because kinetic energy is converted into momentum during the impact.",
    "Because momentum conservation is an approximation and energy conservation is exact."
  ],
  answer: 1,
  why: "That asymmetry between equal times and unequal displacements is the whole mechanism, and it is where the lost kinetic energy goes.",
  whyNot: [
    "The vector/scalar difference matters elsewhere but does not by itself explain why one survives the collision.",
    "The two are different quantities with different units; neither converts into the other.",
    "Both are exact laws under their own conditions."
  ]
},
{
  id: "qz-mom-conservation-03",
  conceptId: "mom-conservation",
  source: "CED 4.3",
  stem: "What happens to the centre-of-mass velocity of a two-object system during a collision with no net external force?",
  options: [
    "It is unchanged throughout.",
    "It falls, because kinetic energy is lost.",
    "It becomes zero if the objects stick together.",
    "It changes direction but not magnitude."
  ],
  answer: 0,
  why: "$\\vec{v}_{cm} = \\frac{\\sum m_i\\vec{v}_i}{\\sum m_i}$ is conservation of momentum divided by the total mass, so a collision does nothing to it. If a question asks what a collision does to a system's centre of mass, the answer is nothing.",
  whyNot: [
    "Kinetic energy is lost from the *relative* motion; the motion of the system as a whole is untouched.",
    "Sticking together makes both objects move at $\\vec{v}_{cm}$, which is generally not zero.",
    "Neither its magnitude nor its direction changes."
  ]
},
{
  id: "qz-mom-conservation-04",
  conceptId: "mom-conservation",
  source: "CED 4.3",
  stem: "At what level does AP Physics 1 assess two-dimensional momentum conservation?",
  options: [
    "Fully quantitatively, including solving simultaneous equations.",
    "Semiquantitatively: setting the component equations up correctly and reasoning about how changing a mass, speed or angle changes the rest.",
    "Qualitatively only, with no equations required.",
    "It is not assessed; two dimensions belong to Physics 2."
  ],
  answer: 1,
  why: "The CED's boundary is explicit. So the useful practice is writing the two component equations and reading dependencies off them, rather than drilling algebra the exam will not ask for.",
  whyNot: [
    "Simultaneous equations are outside the stated boundary.",
    "Equations are expected — it is the solving of coupled ones that is not.",
    "One dimension is treated fully and two dimensions semiquantitatively, both in this course."
  ]
},

{
  id: "qz-mom-system-choice-01",
  conceptId: "mom-system-choice",
  source: "CED 4.3",
  stem: "Is momentum conserved when a ball bounces off a wall?",
  options: [
    "Yes, always — momentum is conserved in all interactions.",
    "No, because the collision is inelastic.",
    "It depends on the system: not for the ball alone, but yes for the ball together with the wall and what it is attached to.",
    "Only if the ball rebounds at the same speed it arrived with."
  ],
  answer: 2,
  why: "The answer has to name a system. With the wall outside, it exerts an external force and the ball's momentum changes; enlarge the system to include the wall and that force becomes internal.",
  whyNot: [
    "Conservation holds at the level of the interaction, but a system you drew badly can gain or lose momentum across its boundary.",
    "Elasticity is about kinetic energy and has no bearing on whether momentum is conserved.",
    "Equal speeds would make it elastic; the momentum question is separate."
  ]
},
{
  id: "qz-mom-system-choice-02",
  conceptId: "mom-system-choice",
  source: "CED 4.3",
  stem: "A 0.20 kg ball rebounds from a wall bolted to a $1.0 \\times 10^4$ kg block on frictionless rollers, changing its momentum by 2.8 kg$\\cdot$m/s. What happens to the block?",
  options: [
    "Nothing measurable, and its momentum change is negligible.",
    "It gains 2.8 kg$\\cdot$m/s of momentum, moving at about $2.8 \\times 10^{-4}$ m/s.",
    "It gains 2.8 kg$\\cdot$m/s of momentum, moving at about 2.8 m/s.",
    "It gains momentum only if the collision is elastic."
  ],
  answer: 1,
  why: "The block takes exactly what the ball lost. Its huge mass makes the resulting *velocity* tiny — 0.28 mm/s — but $v = p/m$, and a large $m$ with a small $v$ is an ordinary amount of momentum.",
  whyNot: [
    "The velocity change is unmeasurable; the momentum change is not, and calling it zero would mean momentum had vanished.",
    "2.8 m/s would require the block to have a mass of 1 kg.",
    "Momentum transfers in every collision, elastic or not."
  ]
},
{
  id: "qz-mom-system-choice-03",
  conceptId: "mom-system-choice",
  source: "CED 4.3",
  stem: "How do you make an inconvenient external force disappear from a momentum analysis?",
  options: [
    "Enlarge the system to include the object exerting it",
    "Shrink the system so the force acts outside it.",
    "Choose a reference frame in which the force is zero.",
    "Wait until the force becomes negligible."
  ],
  answer: 0,
  why: "Internal impulses cancel exactly, because third-law partners act for the same time. Include the raft with the jumper, the rifle with the bullet, and what looked like an external push becomes an internal transfer.",
  whyNot: [
    "Shrinking is what created the problem; the force is external because its source is outside.",
    "No inertial frame change can remove a force — force is frame-independent between inertial frames.",
    "Waiting changes nothing about whose force it is."
  ]
},
{
  id: "qz-mom-system-choice-04",
  conceptId: "mom-system-choice",
  source: "CED 4.3",
  stem: "If a system's total momentum does change, what does the change equal?",
  options: [
    "The kinetic energy gained or lost.",
    "The impulse delivered by the net external force.",
    "Nothing — a change in total momentum violates conservation.",
    "The work done by the external forces."
  ],
  answer: 1,
  why: "$\\vec{J} = \\Delta\\vec{p}$. Momentum was transferred between the system and its surroundings, not created or destroyed — which is why a subsystem gaining momentum is never a violation.",
  whyNot: [
    "Energy and momentum are different quantities with different units and cannot be equated.",
    "Conservation applies when there is no net external force; with one, the transfer is exactly what the law describes.",
    "Work changes energy, not momentum, and it is a force times a displacement rather than a time."
  ]
},

{
  id: "qz-mom-elastic-inelastic-01",
  conceptId: "mom-elastic-inelastic",
  source: "CED 4.4",
  stem: "A student argues: ‘Energy is always conserved, so every collision is elastic.’ What is wrong?",
  options: [
    "Energy is not conserved in collisions.",
    "Elastic means the system's *kinetic* energy is unchanged",
    "Elastic means momentum is unchanged, which is a different test.",
    "Nothing is wrong; the argument is sound."
  ],
  answer: 1,
  why: "The argument proves too much — taken seriously it would make every collision elastic. The test that actually decides it is adding $\\frac{1}{2}mv^2$ over the parts before and after.",
  whyNot: [
    "Total energy is conserved; that is precisely why it cannot be used as evidence here.",
    "Momentum is conserved in inelastic collisions too, so it is not the discriminator either.",
    "The conclusion is false, so the argument cannot be sound."
  ]
},
{
  id: "qz-mom-elastic-inelastic-02",
  conceptId: "mom-elastic-inelastic",
  source: "CED 4.4",
  stem: "On a frictionless track a 1.0 kg glider at 4.0 m/s strikes a stationary 3.0 kg glider. Afterwards they move at $-2.0$ m/s and $+2.0$ m/s. Classify the collision.",
  options: [
    "Inelastic: kinetic energy fell from 8.0 J to 4.0 J.",
    "Perfectly inelastic, since the light glider bounced back.",
    "Elastic: momentum is 4.0 kg$\\cdot$m/s and kinetic energy 8.0 J both before and after.",
    "Impossible: momentum is not conserved."
  ],
  answer: 2,
  why: "Momentum: $4.0$ before, $-2.0 + 6.0 = 4.0$ after. Kinetic energy: $8.0$ J before, $2.0 + 6.0 = 8.0$ J after. Both survive, so the collision is elastic.",
  whyNot: [
    "Adding the two final kinetic energies gives 8.0 J, not 4.0 J.",
    "Perfectly inelastic means the objects move off together with one velocity, which is the opposite of what happened.",
    "The momentum totals match exactly, so nothing is impossible here."
  ]
},
{
  id: "qz-mom-elastic-inelastic-03",
  conceptId: "mom-elastic-inelastic",
  source: "CED 4.4",
  stem: "Which quantity is conserved in more collisions, and under what condition?",
  options: [
    "Kinetic energy, whenever the objects do not deform.",
    "Both equally, since both are conservation laws.",
    "Kinetic energy, whenever there is no friction.",
    "Momentum — in every interaction with no net external force, whatever happens to the energy."
  ],
  answer: 3,
  why: "Kinetic energy is conserved only in the special case of an elastic collision. Momentum survives deformation, heating and sound, because impulses cancel whatever the material does.",
  whyNot: [
    "Deformation is one way to lose kinetic energy, but a collision can lose it without permanent deformation — to sound and vibration.",
    "They have different conditions, and momentum's is satisfied far more often.",
    "External friction over a long interval threatens momentum too; and internal losses can destroy kinetic energy with no external friction at all."
  ]
},
{
  id: "qz-mom-elastic-inelastic-04",
  conceptId: "mom-elastic-inelastic",
  source: "CED 4.4",
  stem: "What does the derived one-dimensional shortcut ‘relative speed of approach equals relative speed of separation’ apply to, and how should it be used?",
  options: [
    "To elastic collisions, as a check on an answer rather than as a quotable law.",
    "To all collisions, as the definition of momentum conservation.",
    "To perfectly inelastic collisions, where the objects separate at zero relative speed.",
    "To explosions, where the pieces separate from rest."
  ],
  answer: 0,
  why: "It follows from the two conservation equations together for an elastic collision. It is neither on the equation sheet nor stated in the CED, so it earns nothing as a cited law — but it catches an arithmetic slip in seconds.",
  whyNot: [
    "It fails for any collision that loses kinetic energy, and it is not a statement of momentum conservation.",
    "A perfectly inelastic collision does separate at zero relative speed, but the relation being described is the elastic one.",
    "Explosions are not collisions, and there is no approach speed to compare."
  ]
},

{
  id: "qz-mom-perfectly-inelastic-01",
  conceptId: "mom-perfectly-inelastic",
  source: "CED 4.4",
  stem: "A 0.040 kg dart at 25 m/s embeds itself in a 0.960 kg cart at rest on a frictionless track. What is their common speed afterwards?",
  options: [
    "25 m/s",
    "12.5 m/s",
    "1.0 m/s",
    "0.96 m/s"
  ],
  answer: 2,
  why: "$v_f = \\frac{m_1v_1}{m_1+m_2} = \\frac{0.040 \\times 25}{1.00} = 1.0$ m/s. That is also the centre-of-mass velocity of the system, which was 1.0 m/s before the collision as well.",
  whyNot: [
    "25 m/s ignores the cart's mass entirely.",
    "12.5 m/s halves the dart's speed, as though the masses were equal.",
    "0.96 m/s divides by the cart's mass instead of the combined mass."
  ]
},
{
  id: "qz-mom-perfectly-inelastic-02",
  conceptId: "mom-perfectly-inelastic",
  source: "CED 4.4",
  stem: "A student finds the final speed of a dart-and-cart by setting the kinetic energy before equal to the kinetic energy after. What is wrong?",
  options: [
    "Nothing, provided the track is frictionless.",
    "Kinetic energy is precisely what is not conserved in a perfectly inelastic collision — here 96% of it is lost — so the equation is false however clean the algebra.",
    "The method is right but needs the masses to be equal.",
    "Energy methods are never valid for collisions of any kind."
  ],
  answer: 1,
  why: "Momentum first, always; energy afterwards, and only to compute how much was lost. The energy route gives a wrong answer that looks respectable, which is what makes it dangerous.",
  whyNot: [
    "Friction on the track is irrelevant: the loss happens inside the collision itself.",
    "Equal masses would not rescue it — a perfectly inelastic collision loses kinetic energy whatever the masses.",
    "Energy methods are valid for elastic collisions, where kinetic energy really is conserved."
  ]
},
{
  id: "qz-mom-perfectly-inelastic-03",
  conceptId: "mom-perfectly-inelastic",
  source: "CED 4.4",
  stem: "The final common velocity of a perfectly inelastic collision equals which quantity that was already fixed before the collision?",
  options: [
    "The faster object's velocity.",
    "The average of the two initial velocities.",
    "The system's centre-of-mass velocity.",
    "The velocity of the heavier object."
  ],
  answer: 2,
  why: "$\\frac{\\sum m_i\\vec{v}_i}{\\sum m_i}$ is the equation sheet's $\\vec{v}_{cm}$, and it was constant throughout. Find $\\vec{v}_{cm}$ before the collision and you already have the answer.",
  whyNot: [
    "The faster object is slowed by the collision unless the other object was already moving with it.",
    "A plain average ignores the masses, and would be right only if they matched.",
    "The heavier object's velocity is changed too, just by less."
  ]
},
{
  id: "qz-mom-perfectly-inelastic-04",
  conceptId: "mom-perfectly-inelastic",
  source: "CED 4.4",
  stem: "Why does a perfectly inelastic collision lose more kinetic energy than any other collision with the same masses and initial velocities?",
  options: [
    "Because sticking together generates the most heat.",
    "Because the objects share one velocity afterwards",
    "Because momentum is not conserved in this case.",
    "Because the combined object has a larger mass and therefore more inertia."
  ],
  answer: 1,
  why: "What remains is only the kinetic energy of the system moving as a whole, at $\\vec{v}_{cm}$. Any other outcome leaves the objects with some motion relative to each other, and that motion carries kinetic energy.",
  whyNot: [
    "Heat is where the energy goes, not why this case maximises the loss.",
    "Momentum is conserved here exactly as in every other collision with no net external force.",
    "The total mass is unchanged by the objects joining."
  ]
},

/* ---- Unit 5 · Torque and rotational dynamics ----------------------------- */

{
  id: "qz-rot-angular-quantities-01",
  conceptId: "rot-angular-quantities",
  source: "CED 5.1",
  stem: "A wheel has a negative angular velocity and a negative angular acceleration. What is it doing?",
  options: [
    "Slowing down, because the angular acceleration is negative.",
    "Speeding up, because the two have the same sign.",
    "Turning at a constant rate, since the signs cancel.",
    "Reversing direction."
  ],
  answer: 1,
  why: "A negative $\\alpha$ means the angular velocity is becoming more negative, not that the wheel is slowing. Same signs means the spin is growing in magnitude — exactly the rule from straight-line motion.",
  whyNot: [
    "Reading a negative $\\alpha$ as ‘slowing down’ is the standard error, and it is right only when $\\omega$ is positive.",
    "Signs are not quantities that cancel; a non-zero $\\alpha$ means the rate is changing.",
    "A reversal needs $\\omega$ to pass through zero, which requires opposite signs."
  ]
},
{
  id: "qz-rot-angular-quantities-02",
  conceptId: "rot-angular-quantities",
  source: "CED 5.1",
  stem: "Is there a universal rule that counterclockwise rotation is positive?",
  options: [
    "Yes — counterclockwise is positive by international convention.",
    "Yes, except in problems involving gears.",
    "No — one direction is typically taken as positive and the other becomes negative; it is a choice you declare.",
    "No, because rotational quantities have no sign at all."
  ],
  answer: 2,
  why: "The CED says ‘typically’, not ‘always’, and a problem may set up the opposite. What is not optional is consistency: once $\\omega$ counterclockwise is positive, an $\\alpha$ speeding up that rotation is positive too.",
  whyNot: [
    "Assuming a fixed convention is worse than having none, because your signs will silently contradict the given data.",
    "Gears are not a special case; the choice is declared per problem in every context.",
    "Rotational quantities certainly carry signs — that is how direction is recorded in this course."
  ]
},
{
  id: "qz-rot-angular-quantities-03",
  conceptId: "rot-angular-quantities",
  source: "CED 5.1",
  stem: "A potter's wheel turns steadily through 5.0 revolutions in 4.0 s. What is its average angular velocity?",
  options: [
    "1.25 rad/s",
    "7.9 rad/s",
    "31 rad/s",
    "450 rad/s"
  ],
  answer: 1,
  why: "Convert first: $5.0 \\times 2\\pi = 31$ rad. Then $\\omega_{avg} = 31 / 4.0 = 7.9$ rad/s. Leaving the angle in revolutions is one of the three standard ways to lose this mark.",
  whyNot: [
    "1.25 is revolutions per second — the angle never converted to radians.",
    "31 rad is the angular *displacement*, not a rate.",
    "450 comes from working in degrees, $1800/4$."
  ]
},
{
  id: "qz-rot-angular-quantities-04",
  conceptId: "rot-angular-quantities",
  source: "CED 5.1",
  stem: "Two points on a rigid spinning disc, one near the hub and one at the rim, are compared. What do they share?",
  options: [
    "Their linear speed.",
    "Their tangential acceleration.",
    "Their distance travelled per second.",
    "Their angular velocity."
  ],
  answer: 3,
  why: "Angular velocity belongs to the system, not to a point: every part of a rigid body sweeps the same angle in the same time. The linear quantities scale with $r$ and therefore differ.",
  whyNot: [
    "Linear speed is $r\\omega$, so the rim point is much faster.",
    "Tangential acceleration is $r\\alpha$ and scales the same way.",
    "Distance per second is speed under another name."
  ]
},

{
  id: "qz-rot-kinematics-equations-01",
  conceptId: "rot-kinematics-equations",
  source: "CED 5.1",
  stem: "A ceiling fan turning at 18 rad/s is switched off and slows uniformly at 1.5 rad/s$^2$. How long does it take to stop, and through what angle does it turn?",
  options: [
    "12 s, 108 rad",
    "27 s, 243 rad",
    "12 s, 216 rad",
    "1.5 s, 27 rad"
  ],
  answer: 0,
  why: "$t = \\omega_0/\\alpha = 12$ s, and $\\omega^2 = \\omega_0^2 + 2\\alpha\\Delta\\theta$ gives $\\Delta\\theta = \\frac{18^2}{2 \\times 1.5} = 108$ rad — about 17 revolutions.",
  whyNot: [
    "27 s would need $\\alpha$ of about 0.67 rad/s$^2$.",
    "216 rad is $\\omega_0 t$, which treats the fan as keeping its initial speed for the whole stop.",
    "1.5 is the angular acceleration in rad/s$^2$, not a time."
  ]
},
{
  id: "qz-rot-kinematics-equations-02",
  conceptId: "rot-kinematics-equations",
  source: "CED 5.1",
  stem: "A problem states that a wheel's braking torque increases as it slows. What does that rule out?",
  options: [
    "Using $\\omega_{avg} = \\Delta\\theta/\\Delta t$.",
    "Reading the angular displacement as the area under an $\\omega$-$t$ graph.",
    "Using the three rotational kinematic equations, which require constant $\\alpha$.",
    "Using radians as the unit of angle."
  ],
  answer: 2,
  why: "A changing torque means a changing $\\alpha$, and the sheet's three rotational equations are valid only while $\\alpha$ is constant. The definitions and the graph readings survive, which is the route left open to you.",
  whyNot: [
    "That is a definition and holds for any motion whatever.",
    "The area rule follows from the definition and is unaffected by $\\alpha$ varying.",
    "Radians are required either way."
  ]
},
{
  id: "qz-rot-kinematics-equations-03",
  conceptId: "rot-kinematics-equations",
  source: "CED 5.1",
  stem: "Which of these is **not** printed on the equation sheet?",
  options: [
    "$\\omega = \\omega_0 + \\alpha t$",
    "$\\theta = \\theta_0 + \\omega_0 t + \\frac{1}{2}\\alpha t^2$",
    "$\\omega^2 = \\omega_0^2 + 2\\alpha(\\theta - \\theta_0)$",
    "$\\omega_{avg} = \\frac{\\omega_0 + \\omega}{2}$"
  ],
  answer: 3,
  why: "The three kinematic equations are printed in the sheet's right-hand column, mirroring the translational ones. The midpoint relation is derived from the first two, holds only for constant $\\alpha$, and is often the fastest independent check on a displacement.",
  whyNot: [
    "Printed, and it is the first entry in the rotational column.",
    "Printed, directly below the velocity equation.",
    "Printed — the one with no time in it."
  ]
},
{
  id: "qz-rot-kinematics-equations-04",
  conceptId: "rot-kinematics-equations",
  source: "CED 5.1",
  stem: "What does the equation sheet *not* tell you about the rotational kinematic equations?",
  options: [
    "The condition that $\\alpha$ must be constant.",
    "The symbols used for angular quantities.",
    "The relationship between $\\theta$ and $\\theta_0$.",
    "How many equations there are."
  ],
  answer: 0,
  why: "The sheet prints equations, not conditions. Carrying the constant-$\\alpha$ requirement yourself is what stops you applying them to a curving $\\omega$-$t$ graph, where they are simply wrong.",
  whyNot: [
    "The sheet's variable key defines $\\alpha$, $\\theta$ and $\\omega$ explicitly.",
    "Both appear in the printed equations.",
    "All three are printed together."
  ]
},

{
  id: "qz-rot-motion-graphs-01",
  conceptId: "rot-motion-graphs",
  source: "CED 5.1",
  stem: "A student says: ‘The angular velocity is largest at this point on the graph, so the angular acceleration is largest here too.’ What is wrong?",
  options: [
    "Nothing — a large $\\omega$ does imply a large $\\alpha$.",
    "It confuses the graph's value with its slope",
    "It confuses the graph's value with its area.",
    "It is wrong only if the graph crosses the time axis."
  ],
  answer: 1,
  why: "Angular acceleration is the *slope* of an $\\omega$-$t$ graph, and a curve usually peaks exactly where its slope vanishes — so the claim is often not merely wrong but backwards.",
  whyNot: [
    "$\\omega$ and $\\alpha$ are independent at any instant, exactly as $v$ and $a$ are.",
    "The area gives $\\Delta\\theta$; the error here is about the slope.",
    "The point holds anywhere on the graph, crossing or not."
  ]
},
{
  id: "qz-rot-motion-graphs-02",
  conceptId: "rot-motion-graphs",
  source: "CED 5.1",
  stem: "A turntable's angular velocity rises linearly from 0 to 8.0 rad/s over 4.0 s, then holds at 8.0 rad/s for 3.0 s. What is the total angular displacement?",
  options: [
    "56 rad",
    "24 rad",
    "16 rad",
    "40 rad"
  ],
  answer: 3,
  why: "Area under the $\\omega$-$t$ graph: a triangle of $\\frac{1}{2}(4.0)(8.0) = 16$ rad plus a rectangle of $3.0 \\times 8.0 = 24$ rad, giving 40 rad — about 6.4 revolutions.",
  whyNot: [
    "56 rad treats the whole 7.0 s as though the turntable spun at 8.0 rad/s throughout.",
    "24 rad is the rectangle alone.",
    "16 rad is the triangle alone."
  ]
},
{
  id: "qz-rot-motion-graphs-03",
  conceptId: "rot-motion-graphs",
  source: "CED 5.1",
  stem: "A wheel spins one way, stops, then spins back. Its $\\omega$-$t$ graph crosses the axis. What does the total signed area give?",
  options: [
    "The total angle turned through, in both directions.",
    "The net angular displacement, with the reverse rotation subtracting.",
    "Zero, always, for a graph that crosses the axis.",
    "The final angular position."
  ],
  answer: 1,
  why: "Signed area gives the net change, exactly as for displacement in straight-line motion. For the total angle turned you add the magnitudes of the areas instead — a different question with a different arithmetic.",
  whyNot: [
    "That is the sum of the magnitudes, not the signed sum.",
    "A crossing does not mean the areas are equal; the wheel may spin further one way than the other.",
    "Position needs $\\theta_0$, which no $\\omega$-$t$ graph can supply."
  ]
},
{
  id: "qz-rot-motion-graphs-04",
  conceptId: "rot-motion-graphs",
  source: "CED 5.1",
  stem: "Why can you not read a wheel's absolute angular position off an $\\omega$-$t$ graph?",
  options: [
    "Because the area gives $\\Delta\\theta$",
    "Because angular position is not defined for a spinning body.",
    "Because the graph shows only the magnitude of $\\omega$.",
    "Because absolute position requires the angular acceleration as well."
  ],
  answer: 0,
  why: "The same limitation as reading position off a velocity-time graph: an area is a change. $\\theta = \\theta_0 + (\\text{signed area})$.",
  whyNot: [
    "Angular position is perfectly well defined, given a reference direction.",
    "The graph is signed; that is why areas below the axis count negative.",
    "Angular acceleration is already encoded in the graph's slope and adds nothing here."
  ]
},

{
  id: "qz-rot-linear-rotational-link-01",
  conceptId: "rot-linear-rotational-link",
  source: "CED 5.2",
  stem: "A grinding wheel of radius 0.15 m spins at 40 rad/s. How fast is a point 0.050 m from the axis moving, and what is its angular velocity?",
  options: [
    "6.0 m/s, at 40 rad/s",
    "2.0 m/s, at 13 rad/s",
    "2.0 m/s, at 40 rad/s",
    "0.13 m/s, at 40 rad/s"
  ],
  answer: 2,
  why: "$v = r\\omega = 0.050 \\times 40 = 2.0$ m/s. The angular velocity is a property of the rigid body, so it is the same 40 rad/s everywhere — that is exactly what makes the rotational description worth having.",
  whyNot: [
    "6.0 m/s is the rim speed, at $r = 0.15$ m.",
    "Angular velocity does not fall off with radius; only the linear speed does.",
    "0.13 m/s divides rather than multiplies."
  ]
},
{
  id: "qz-rot-linear-rotational-link-02",
  conceptId: "rot-linear-rotational-link",
  source: "CED 5.2",
  stem: "A belt runs over a small pulley and a large pulley mounted on the same shaft as a third wheel. Which quantity transfers through the belt, and which through the shaft?",
  options: [
    "$v$ through the belt; $\\omega$ through the shaft.",
    "$\\omega$ through the belt; $v$ through the shaft.",
    "$\\omega$ through both.",
    "$v$ through both."
  ],
  answer: 0,
  why: "A belt that does not slip carries one linear speed along its length; a shared shaft forces one angular velocity. Carrying the wrong quantity across is precisely what this kind of question is built to test.",
  whyNot: [
    "Two pulleys of different radii joined by a belt have different $\\omega$, since $\\omega = v/r$.",
    "Wheels on one shaft have different rim speeds if their radii differ.",
    "The belt and the shaft impose different constraints, so one rule cannot cover both."
  ]
},
{
  id: "qz-rot-linear-rotational-link-03",
  conceptId: "rot-linear-rotational-link",
  source: "CED 5.2",
  stem: "What happens if you use degrees rather than radians in $v = r\\omega$?",
  options: [
    "Nothing, provided you are consistent.",
    "The answer is wrong by a factor of about 57.",
    "The answer is wrong by a factor of $2\\pi$.",
    "The units come out wrong, so the error is caught automatically."
  ],
  answer: 1,
  why: "The relation is the definition of the radian doing its work: one radian of turn at radius $r$ moves an arc of exactly $r$. A degree is about $1/57$ of that, so the answer is out by that factor.",
  whyNot: [
    "Consistency does not help; the relation is only true in radians.",
    "$2\\pi$ is the revolutions-to-radians factor; degrees to radians is $\\pi/180$, about $1/57$.",
    "Radians are dimensionless, so the units look perfectly fine — which is exactly why this error survives a units check."
  ]
},
{
  id: "qz-rot-linear-rotational-link-04",
  conceptId: "rot-linear-rotational-link",
  source: "CED 5.2",
  stem: "In $v = r\\omega$, where is $r$ measured?",
  options: [
    "Along the object's surface from a marked reference point.",
    "From the centre of mass to the point in question.",
    "From the axis to any convenient point in the figure.",
    "Perpendicular from the axis of rotation to the point in question."
  ],
  answer: 3,
  why: "It is the perpendicular distance to the axis, which is what makes the arc relation $\\Delta s = r\\Delta\\theta$ true. Mass or points lying on the axis have $r = 0$ and move not at all.",
  whyNot: [
    "Surface distance is not the same as distance from the axis for anything but a flat disc measured radially.",
    "The centre of mass need not lie on the axis — a rod pivoted at one end is the standard case.",
    "It must be to the point whose speed you want, not to any point."
  ]
},

{
  id: "qz-rot-tangential-vs-centripetal-01",
  conceptId: "rot-tangential-vs-centripetal",
  source: "CED 5.2",
  stem: "A disc spins at a perfectly constant rate. Which acceleration components does a rim point have?",
  options: [
    "None — constant angular velocity means zero acceleration.",
    "Tangential only.",
    "Centripetal only.",
    "Both, in equal measure."
  ],
  answer: 2,
  why: "Constant $\\omega$ means $\\alpha = 0$, so $a_T = r\\alpha = 0$. The centripetal component $a_c = \\omega^2r$ remains and is often large — the point's direction of motion is changing continuously.",
  whyNot: [
    "This is the standard error: steady rotation still turns every point, and turning is acceleration.",
    "Tangential acceleration is the one that vanishes when the rate is steady.",
    "The tangential component is exactly zero here, so they cannot be equal."
  ]
},
{
  id: "qz-rot-tangential-vs-centripetal-02",
  conceptId: "rot-tangential-vs-centripetal",
  source: "CED 5.2",
  stem: "A rim point has $a_T = 1.8$ m/s$^2$ and $a_c = 1.35$ m/s$^2$. What is the magnitude of its total acceleration?",
  options: [
    "3.15 m/s$^2$",
    "0.45 m/s$^2$",
    "2.43 m/s$^2$",
    "2.25 m/s$^2$"
  ],
  answer: 3,
  why: "The two components are perpendicular, so $a = \\sqrt{1.8^2 + 1.35^2} = 2.25$ m/s$^2$ — the 3–4–5 triangle again, at 37° inward from the tangent.",
  whyNot: [
    "3.15 adds them arithmetically, which perpendicular components never permit.",
    "0.45 subtracts them, which would be right only if they were antiparallel.",
    "2.43 is their product and corresponds to nothing."
  ]
},
{
  id: "qz-rot-tangential-vs-centripetal-03",
  conceptId: "rot-tangential-vs-centripetal",
  source: "CED 5.2",
  stem: "Which expression for centripetal acceleration in terms of angular quantities is correct?",
  options: [
    "$a_c = \\alpha^2 r$",
    "$a_c = \\omega^2 r$",
    "$a_c = \\alpha r^2$",
    "$a_c = \\omega r$"
  ],
  answer: 1,
  why: "Substitute $v = r\\omega$ into $a_c = v^2/r$. This derived form is usually the convenient one, because rotational problems hand you $\\omega$ rather than $v$ — and note that $a_c$ grows with $r$, so the rim is under far more than the hub.",
  whyNot: [
    "The $\\alpha$ version would predict zero centripetal acceleration for a steadily spinning wheel, which is false.",
    "$\\alpha r^2$ has the wrong dimensions and the wrong angular quantity.",
    "$\\omega r$ is the linear *speed*, not an acceleration."
  ]
},
{
  id: "qz-rot-tangential-vs-centripetal-04",
  conceptId: "rot-tangential-vs-centripetal",
  source: "CED 5.2",
  stem: "What does each acceleration component do to a point's motion?",
  options: [
    "Centripetal changes the direction; tangential changes the speed.",
    "Centripetal changes the speed; tangential changes the direction.",
    "Both change the speed, by different amounts.",
    "Both change the direction, in opposite senses."
  ],
  answer: 0,
  why: "That division is why they are treated separately: the inward component demands a net inward force, and the tangential one traces back to a net torque. They sit in different columns of the equation sheet for good reason.",
  whyNot: [
    "This is the swap, and it is the source of most confusion in this concept.",
    "A purely inward force does no work and cannot change the speed.",
    "The tangential component points along the motion and so cannot turn it."
  ]
},

{
  id: "qz-rot-torque-01",
  conceptId: "rot-torque",
  source: "CED 5.3",
  stem: "In $\\tau = rF\\sin\\theta$, which two lines does $\\theta$ sit between?",
  options: [
    "The force and the horizontal.",
    "The force and the ground.",
    "The force and the line from the axis to the point where the force is applied.",
    "The object's long axis and the horizontal."
  ],
  answer: 2,
  why: "The sheet prints the equation but not which angle $\\theta$ is, and that is where the marks are lost. When a problem hands you an angle, the first job is to work out which two lines it lies between.",
  whyNot: [
    "The horizontal is only relevant if the position vector happens to be horizontal.",
    "The ground is a feature of the room, not of the rotation.",
    "The object's axis coincides with the position vector only in special cases."
  ]
},
{
  id: "qz-rot-torque-02",
  conceptId: "rot-torque",
  source: "CED 5.3",
  stem: "A 25 N force is applied at the outer edge of a 0.80 m wide door, directed at 53° to the plane of the door. What torque does it exert about the hinge? ($\\sin 53° = 0.8$.)",
  options: [
    "20 N$\\cdot$m",
    "16 N$\\cdot$m",
    "12 N$\\cdot$m",
    "31 N$\\cdot$m"
  ],
  answer: 1,
  why: "$\\tau = rF\\sin\\theta = 0.80 \\times 25 \\times 0.8 = 16$ N$\\cdot$m. Pushing perpendicular to the door would give the full 20 N$\\cdot$m, which is why doors are pushed square-on.",
  whyNot: [
    "20 N$\\cdot$m is $rF$ with the $\\sin\\theta$ dropped — correct only at 90°.",
    "12 N$\\cdot$m uses $\\cos 53° = 0.6$, that is, the wrong pairing of angle and function.",
    "31 N$\\cdot$m exceeds $rF$, which no torque from this force can."
  ]
},
{
  id: "qz-rot-torque-03",
  conceptId: "rot-torque",
  source: "CED 5.3",
  stem: "Name a way a substantial force can produce **zero** torque about an axis.",
  options: [
    "By acting perpendicular to the object's surface.",
    "By acting at the centre of mass.",
    "By being smaller than the object's weight.",
    "By being directed along the line joining the axis to its point of application."
  ],
  answer: 3,
  why: "Then $\\sin\\theta = 0$: the line of action passes through the axis, so the force has no turning effect at all. Applying it *at* the axis, where $r = 0$, does the same thing. Problems are built to reward the student who discards such a force entirely.",
  whyNot: [
    "A perpendicular push is usually the most effective, not the least.",
    "The centre of mass is not generally on the axis, and a force there can turn the body.",
    "Size has nothing to do with it; it is geometry that kills the torque."
  ]
},
{
  id: "qz-rot-torque-04",
  conceptId: "rot-torque",
  source: "CED 5.3",
  stem: "What does AP Physics 1 expect you to do with the **direction** of a torque?",
  options: [
    "Describe it as clockwise or counterclockwise about a stated axis, carried as a sign.",
    "Give it as a vector along the axis, using the right-hand rule.",
    "Give it as a vector in the plane of rotation.",
    "Ignore direction entirely, since torque is a scalar."
  ],
  answer: 0,
  why: "The CED's boundary is firm: torque magnitudes with sign conventions are in scope; treating the direction of a torque as a vector along the axle is not.",
  whyNot: [
    "The right-hand rule and the axial vector are explicitly outside this course.",
    "A torque vector does not lie in the plane of rotation in any case.",
    "Direction matters very much — it decides whether two torques add or cancel."
  ]
},

{
  id: "qz-rot-lever-arm-01",
  conceptId: "rot-lever-arm",
  source: "CED 5.3",
  stem: "How is the lever arm defined?",
  options: [
    "The distance from the axis to the point where the force is applied.",
    "The length of the object being turned.",
    "The perpendicular distance from the axis to the force's extended line of action.",
    "The component of the force perpendicular to the object."
  ],
  answer: 2,
  why: "Extend the force to an infinite line, then measure from the axis to that line by the shortest path. Numerically $r_{\\perp} = r\\sin\\theta$, which is why the sheet's $\\tau = r_{\\perp}F$ and the framework's $\\tau = rF_{\\perp}$ agree.",
  whyNot: [
    "That is $r$, the position vector's length, and using it drops the $\\sin\\theta$ silently.",
    "The object may extend well beyond the point where the force acts.",
    "That is $F_{\\perp}$, a force rather than a distance — the other grouping of the same product."
  ]
},
{
  id: "qz-rot-lever-arm-02",
  conceptId: "rot-lever-arm",
  source: "CED 5.3",
  stem: "A mechanic pulls 120 N on a spanner at a point 0.25 m from the bolt, at 30° to the handle. What is the torque?",
  options: [
    "30 N$\\cdot$m",
    "26 N$\\cdot$m",
    "15 N$\\cdot$m",
    "60 N$\\cdot$m"
  ],
  answer: 2,
  why: "The lever arm is $r\\sin 30° = 0.125$ m, so $\\tau = 0.125 \\times 120 = 15$ N$\\cdot$m. Pulling perpendicular instead would need only 60 N for the same turning effect.",
  whyNot: [
    "30 N$\\cdot$m is $rF$ with the angle ignored.",
    "26 N$\\cdot$m uses $\\cos 30°$ — the wrong function for an angle measured from the handle.",
    "60 is the perpendicular force in newtons that would give the same torque, not the torque."
  ]
},
{
  id: "qz-rot-lever-arm-03",
  conceptId: "rot-lever-arm",
  source: "CED 5.3",
  stem: "Why does a longer spanner turn a stiff bolt more easily, if your hand is no stronger?",
  options: [
    "Because the extra length increases the force your hand can apply.",
    "Because it lets the same force act along a line further from the bolt, increasing the lever arm.",
    "Because a longer handle reduces the rotational inertia of the bolt.",
    "Because the angle between force and handle is easier to keep at 90°."
  ],
  answer: 1,
  why: "Torque is lever arm times force, so a larger lever arm gives more torque from an unchanged force. Slipping a pipe over the handle is the same intervention; so is putting a door handle at the edge furthest from the hinges.",
  whyNot: [
    "Your hand's strength does not change with the tool.",
    "The bolt's rotational inertia is irrelevant — it is barely moving, and what resists is friction in the thread.",
    "Grip angle is a matter of technique and works at any handle length."
  ]
},
{
  id: "qz-rot-lever-arm-04",
  conceptId: "rot-lever-arm",
  source: "CED 5.3",
  stem: "Several forces act on a diagram and you must rank their torques quickly. What is the fastest approach?",
  options: [
    "Compute $rF\\sin\\theta$ for each in turn.",
    "Rank by force magnitude, since torque is proportional to force.",
    "Rank by distance from the axis to the point of application.",
    "Extend each line of action, see which passes furthest from the axis"
  ],
  answer: 3,
  why: "The lever arm can often be read straight off a drawn figure, which skips the trigonometry entirely. You will usually have the ranking before anyone else has written down a sine.",
  whyNot: [
    "Correct but slowest, and the question asks for the fast route.",
    "Force alone ignores geometry — a large force through the axis produces nothing.",
    "Distance to the application point is $r$, not $r_{\\perp}$, and the two differ whenever the force is not perpendicular."
  ]
},

{
  id: "qz-rot-inertia-01",
  conceptId: "rot-inertia",
  source: "CED 5.4",
  stem: "A hoop and a solid disc have the same mass and radius. Which has the larger rotational inertia about its central axis?",
  options: [
    "The hoop, because all its mass sits at the maximum radius.",
    "The disc, because its mass is spread over a larger area.",
    "They are equal, because the masses are equal.",
    "It cannot be said without knowing the thickness."
  ],
  answer: 0,
  why: "$I = \\sum m_ir_i^2$ weights mass by the *square* of its distance. A hoop keeps every gram at the full radius; a disc has much of its material near the centre, contributing almost nothing.",
  whyNot: [
    "Area is not what the formula weights by — distance from the axis is.",
    "The equal-mass answer ignores the $r^2$, which is the entire content of the concept.",
    "Thickness affects neither, given equal mass and radius."
  ]
},
{
  id: "qz-rot-inertia-02",
  conceptId: "rot-inertia",
  source: "CED 5.4",
  stem: "Two 2.0 kg balls sit at the ends of a light 1.2 m rod. What is the rotational inertia about an axis through the rod's centre, perpendicular to it?",
  options: [
    "2.88 kg$\\cdot$m$^2$",
    "5.76 kg$\\cdot$m$^2$",
    "1.44 kg$\\cdot$m$^2$",
    "2.40 kg$\\cdot$m$^2$"
  ],
  answer: 2,
  why: "Each ball is 0.60 m from the axis: $2 \\times (2.0 \\times 0.60^2) = 1.44$ kg$\\cdot$m$^2$. Move the axis to one end and it doubles to 2.88, for exactly the same 4.0 kg of matter.",
  whyNot: [
    "2.88 is the value about an axis through one end.",
    "5.76 uses the full 1.2 m for both balls.",
    "2.40 is $\\sum m_ir_i$ without squaring, and its units are kg$\\cdot$m."
  ]
},
{
  id: "qz-rot-inertia-03",
  conceptId: "rot-inertia",
  source: "CED 5.4",
  stem: "What does the CED say about rotational inertias of extended bodies such as rods, discs and spheres?",
  options: [
    "They must be memorised, since they appear in most rotational questions.",
    "They will be provided within the exam",
    "They are derived by integration, which is expected in this course.",
    "They are never needed, since only point-mass systems are examined."
  ],
  answer: 1,
  why: "Worth knowing before spending a week memorising a table you will be handed. Your own calculations are capped at five objects in a two-dimensional arrangement.",
  whyNot: [
    "The CED says the exam supplies them.",
    "Integration is not part of an algebra-based course.",
    "Extended bodies appear constantly — pulleys, rods and rolling objects."
  ]
},
{
  id: "qz-rot-inertia-04",
  conceptId: "rot-inertia",
  source: "CED 5.4",
  stem: "Why is it wrong to say ‘this object has a rotational inertia of 4.0 kg$\\cdot$m$^2$’ with nothing further?",
  options: [
    "Because rotational inertia has no units of its own.",
    "Because rotational inertia depends on the angular velocity, which has not been given.",
    "Because rotational inertia is defined about a specified axis",
    "Because rotational inertia is a vector and needs a direction."
  ],
  answer: 2,
  why: "The two balls on a rod give 1.44 or 2.88 kg$\\cdot$m$^2$ for the same object, depending on where the axis is. The harder version of this error is computing $I$ about one axis and using it with torques taken about another.",
  whyNot: [
    "kg$\\cdot$m$^2$ falls straight out of $\\sum m_ir_i^2$.",
    "$I$ is a property of the mass distribution and does not depend on how fast the body spins.",
    "It is a scalar."
  ]
},

{
  id: "qz-rot-parallel-axis-01",
  conceptId: "rot-parallel-axis",
  source: "CED 5.4",
  stem: "For a 2.0 m rod pivoted at one end, what value of $d$ goes into $I' = I_{cm} + Md^2$?",
  options: [
    "2.0 m, the length of the rod.",
    "1.0 m, from the centre of mass to the end.",
    "4.0 m, twice the length.",
    "0.5 m, a quarter of the length."
  ],
  answer: 1,
  why: "$d$ is the perpendicular distance **between the two axes**, and the centre-of-mass axis of a uniform rod is at its midpoint. Using the rod's full length is the standard error and inflates the added term by a factor of four.",
  whyNot: [
    "The length is the distance from end to end, not from the centre to an end.",
    "Nothing in the problem is 4.0 m long.",
    "0.5 m would place the second axis a quarter of the way along, not at the end."
  ]
},
{
  id: "qz-rot-parallel-axis-02",
  conceptId: "rot-parallel-axis",
  source: "CED 5.4",
  stem: "Which axis in a given plane gives the **smallest** rotational inertia, and how do you know from the formula?",
  options: [
    "The axis through the centre of mass, because $Md^2$ can never be negative.",
    "The axis furthest from the centre of mass, because distance reduces the resistance.",
    "The axis through the object's geometric centre, whether or not that is the centre of mass.",
    "It depends on the mass, so no general statement is possible."
  ],
  answer: 0,
  why: "$I' = I_{cm} + Md^2 \\ge I_{cm}$ always. It is also a fast qualitative tool: for a given torque, the axis nearest the centre of mass gives the largest $\\alpha$, since $\\alpha = \\tau/I$.",
  whyNot: [
    "Distance increases $I$; that is what the $Md^2$ term does.",
    "For a non-uniform body the geometric centre and the centre of mass differ, and it is the centre of mass that matters.",
    "The inequality holds for every mass, so the statement is fully general."
  ]
},
{
  id: "qz-rot-parallel-axis-03",
  conceptId: "rot-parallel-axis",
  source: "CED 5.4",
  stem: "A uniform 3.0 kg rod has $I_{cm} = 1.0$ kg$\\cdot$m$^2$. What is its rotational inertia about a parallel axis 0.50 m from the centre?",
  options: [
    "1.75 kg$\\cdot$m$^2$",
    "2.5 kg$\\cdot$m$^2$",
    "0.25 kg$\\cdot$m$^2$",
    "4.0 kg$\\cdot$m$^2$"
  ],
  answer: 0,
  why: "$I' = 1.0 + 3.0 \\times 0.50^2 = 1.75$ kg$\\cdot$m$^2$.",
  whyNot: [
    "2.5 uses $Md$ without squaring the distance.",
    "0.25 is $Md^2$ alone, with $I_{cm}$ left out — and an $I'$ below $I_{cm}$ is impossible.",
    "4.0 is the value about an axis through the end, where $d = 1.0$ m."
  ]
},
{
  id: "qz-rot-parallel-axis-04",
  conceptId: "rot-parallel-axis",
  source: "CED 5.4",
  stem: "Which condition on the parallel-axis theorem does the equation sheet **not** state?",
  options: [
    "That $M$ is the total mass.",
    "That the result is in kg$\\cdot$m$^2$.",
    "That $I_{cm}$ must be about an axis through the centre of mass, and the two axes must be parallel.",
    "That $d$ is squared."
  ],
  answer: 2,
  why: "The sheet prints the equation and no conditions. You cannot chain the theorem from an arbitrary starting axis, and tilting the axis is a different calculation altogether — one this course does not ask for.",
  whyNot: [
    "The symbol key identifies $M$ as mass.",
    "Units follow from the quantities and are not a hidden condition.",
    "The square is written in the printed equation."
  ]
},

{
  id: "qz-rot-equilibrium-01",
  conceptId: "rot-equilibrium",
  source: "CED 5.5",
  stem: "Does rotational equilibrium mean the object is not rotating?",
  options: [
    "Yes — equilibrium means at rest.",
    "No: it means the net torque is zero",
    "Yes, unless the object is also in translational equilibrium.",
    "No: it means the angular acceleration is constant."
  ],
  answer: 1,
  why: "It is Newton's first law in rotational dress. A wheel spinning at a steady rate forever is in rotational equilibrium, exactly as a car at constant velocity is in translational equilibrium.",
  whyNot: [
    "This is the same misreading of ‘equilibrium’ that appears in the translational case.",
    "The two kinds of equilibrium are independent — the CED says a system can be in one without the other.",
    "Constant $\\alpha$ would mean the angular velocity is changing steadily, which is not equilibrium at all."
  ]
},
{
  id: "qz-rot-equilibrium-02",
  conceptId: "rot-equilibrium",
  source: "CED 5.5",
  stem: "In a static problem with two unknown support forces, where should you place the axis for the torque equation?",
  options: [
    "At the real physical pivot, since that is what the body turns about.",
    "At the centre of mass, since the weight then drops out.",
    "At the point where one unknown force acts, so its lever arm is zero and it drops out.",
    "Anywhere, but the arithmetic is the same wherever you choose."
  ],
  answer: 2,
  why: "A static body is not rotating about anything, so any axis is legal — and choosing the line of one unknown leaves one equation in one unknown instead of one in two. That is the difference between a solvable problem and a stuck one.",
  whyNot: [
    "Insisting on a physical pivot usually leaves both unknowns in the equation.",
    "The weight is generally known, so removing it buys nothing; the unknowns are what you want gone.",
    "Any axis is legal, but the *work* differs enormously, which is the whole point of choosing."
  ]
},
{
  id: "qz-rot-equilibrium-03",
  conceptId: "rot-equilibrium",
  source: "CED 5.5",
  stem: "A 20 kg uniform plank 4.0 m long rests on a support at its left end and another 3.0 m from that end. A 50 kg person stands 2.5 m from the left end. What upward force does the far support exert? Use $g = 9.8$ m/s$^2$.",
  options: [
    "343 N",
    "539 N",
    "686 N",
    "147 N"
  ],
  answer: 1,
  why: "Take torques about the left support, where the other unknown drops out: $F_B(3.0) = (20)(9.8)(2.0) + (50)(9.8)(2.5) = 1617$, so $F_B = 539$ N. The left support then carries $686 - 539 = 147$ N.",
  whyNot: [
    "343 N is half the total weight, which would be right only if the loads were symmetric about the two supports.",
    "686 N is the whole weight of plank and person together.",
    "147 N is the force on the *left* support."
  ]
},
{
  id: "qz-rot-equilibrium-04",
  conceptId: "rot-equilibrium",
  source: "CED 5.5",
  stem: "Give a system in translational equilibrium but **not** rotational equilibrium.",
  options: [
    "A book resting on a table.",
    "A car moving at constant velocity.",
    "A wheel spinning steadily on a frictionless axle.",
    "Two people pushing opposite edges of a revolving door with equal and opposite forces."
  ],
  answer: 3,
  why: "The forces sum to zero, so the door does not move off its axle; the torques add rather than cancel, so it spins up. The CED is explicit that a system may be in one kind of equilibrium without the other.",
  whyNot: [
    "The book is in both kinds of equilibrium.",
    "So is the car.",
    "A steadily spinning wheel is in rotational equilibrium too — its net torque is zero."
  ]
},

{
  id: "qz-rot-newton-second-rotational-01",
  conceptId: "rot-newton-second-rotational",
  source: "CED 5.6",
  stem: "A block hangs from a string wrapped around a pulley that has rotational inertia. Is the string tension equal to the block's weight?",
  options: [
    "Yes, since the string supports the block.",
    "No — if it were, the net force on the block would be zero and it would not accelerate.",
    "Yes, provided the axle is frictionless.",
    "No — the tension is greater than the weight, because the pulley resists."
  ],
  answer: 1,
  why: "The tension is *less* than the weight, and the shortfall is what accelerates the block. The massless pulley of earlier problems is the special case $I = 0$; if a problem bothered to give you $I$, the equality does not hold.",
  whyNot: [
    "Supporting a stationary block would require $T = mg$; a falling one does not.",
    "A frictionless axle removes one torque but does not make the pulley massless.",
    "A tension larger than the weight would send the block upwards."
  ]
},
{
  id: "qz-rot-newton-second-rotational-02",
  conceptId: "rot-newton-second-rotational",
  source: "CED 5.6",
  stem: "A pulley of radius 0.10 m and rotational inertia 0.020 kg$\\cdot$m$^2$ carries a string with a 2.0 kg block on the end. What is the block's acceleration? Use $g = 9.8$ m/s$^2$.",
  options: [
    "9.8 m/s$^2$",
    "2.45 m/s$^2$",
    "4.9 m/s$^2$",
    "0.98 m/s$^2$"
  ],
  answer: 2,
  why: "$I/R^2 = 0.020/0.010 = 2.0$ kg, so the pulley resists as though it were a 2.0 kg block sharing the string: $a = \\frac{mg}{m + I/R^2} = \\frac{19.6}{4.0} = 4.9$ m/s$^2$, with $\\alpha = a/R = 49$ rad/s$^2$ and $T = 9.8$ N.",
  whyNot: [
    "9.8 m/s$^2$ is free fall, which would require the pulley to have no rotational inertia.",
    "2.45 m/s$^2$ is $g/4$ and corresponds to twice the effective pulley mass.",
    "0.98 m/s$^2$ is out by a factor of five."
  ]
},
{
  id: "qz-rot-newton-second-rotational-03",
  conceptId: "rot-newton-second-rotational",
  source: "CED 5.6",
  stem: "What constraint links a hanging block's linear acceleration to the pulley's angular acceleration?",
  options: [
    "$a = R\\alpha$, from the string not slipping or stretching.",
    "$a = \\alpha / R$, since a larger pulley turns more slowly.",
    "$a = \\alpha$, since the string transmits motion unchanged.",
    "$a = R^2\\alpha$, matching the form of the rotational inertia."
  ],
  answer: 0,
  why: "It is $a_T = r\\alpha$ applied at the rim, and it is not on the equation sheet. Drop it and you have three unknowns and two equations.",
  whyNot: [
    "This inverts the radius dependence, and the units come out wrong.",
    "$a$ and $\\alpha$ have different units, so they cannot be equal.",
    "The $R^2$ belongs to $I$, not to this kinematic constraint."
  ]
},
{
  id: "qz-rot-newton-second-rotational-04",
  conceptId: "rot-newton-second-rotational",
  source: "CED 5.6",
  stem: "What constraint on $\\tau_{net} = I\\alpha$ has no translational counterpart?",
  options: [
    "That the system must be rigid.",
    "That the torques and the rotational inertia must be taken about the same axis.",
    "That $\\alpha$ must be constant.",
    "That the net torque must be non-zero."
  ],
  answer: 1,
  why: "Mass does not care which axis you chose; rotational inertia is defined by one. Computing torques about one axis and $I$ about another is where most errors in this topic live.",
  whyNot: [
    "Rigidity is assumed, but the translational law has assumptions of its own and this is not the asymmetry.",
    "The second law holds instant by instant whether or not $\\alpha$ is constant — that condition belongs to the kinematic equations.",
    "A zero net torque is the equilibrium case of the same equation."
  ]
},

/* ---- Unit 6 · Energy and momentum of rotating systems --------------------- */

{
  id: "qz-rem-rotational-ke-01",
  conceptId: "rem-rotational-ke",
  source: "CED 6.1",
  stem: "How can a body have kinetic energy while its centre of mass is at rest?",
  options: [
    "It cannot — kinetic energy requires the centre of mass to move.",
    "Because kinetic energy belongs to the pieces",
    "Because rotational kinetic energy is a form of potential energy stored in the axle.",
    "Because the object's angular momentum supplies it."
  ],
  answer: 1,
  why: "Sum $\\frac{1}{2}m_iv_i^2$ over the parts, with $v_i = r_i\\omega$, and the shared $\\omega^2$ factors out to leave $\\frac{1}{2}I\\omega^2$. A grindstone on its spindle has real kinetic energy and goes nowhere.",
  whyNot: [
    "This is exactly the case the rotational term exists to describe.",
    "Nothing is stored in the axle; the energy is in the motion of the material.",
    "Angular momentum is a separate quantity, and it does not ‘supply’ energy."
  ]
},
{
  id: "qz-rem-rotational-ke-02",
  conceptId: "rem-rotational-ke",
  source: "CED 6.1",
  stem: "A flywheel with $I = 0.45$ kg$\\cdot$m$^2$ spins at 120 rad/s and is allowed to slow to 40 rad/s. How much energy has it delivered?",
  options: [
    "$2.9 \\times 10^3$ J",
    "$3.2 \\times 10^3$ J",
    "$3.6 \\times 10^2$ J",
    "$1.8 \\times 10^3$ J"
  ],
  answer: 0,
  why: "$\\frac{1}{2}(0.45)(120^2) = 3240$ J to start, $\\frac{1}{2}(0.45)(40^2) = 360$ J left, so 2880 J was delivered. Note that dropping to a third of the angular speed leaves only a ninth of the energy.",
  whyNot: [
    "3240 J is the whole store, which would need the wheel to stop.",
    "360 J is what remains, not what was delivered.",
    "1800 J would correspond to halving the energy, which happens at about 85 rad/s."
  ]
},
{
  id: "qz-rem-rotational-ke-03",
  conceptId: "rem-rotational-ke",
  source: "CED 6.1",
  stem: "Does a wheel spinning clockwise at 10 rad/s have negative rotational kinetic energy?",
  options: [
    "Yes, if clockwise was chosen as the negative direction.",
    "Yes, because $\\omega$ is negative.",
    "No — $\\omega$ is squared, so the sense of rotation cannot survive into the answer.",
    "No, but its kinetic energy is smaller than that of an identical wheel spinning the other way."
  ],
  answer: 2,
  why: "Kinetic energy is a scalar and is never negative. Two wheels spinning at the same rate in opposite senses have identical kinetic energy — which is exactly why energy methods cannot tell you which way something is turning.",
  whyNot: [
    "A sign convention applies to $\\omega$ and $L$, never to an energy.",
    "$\\omega$ may be negative, and $\\omega^2$ is not.",
    "Their energies are equal, not merely both positive."
  ]
},
{
  id: "qz-rem-rotational-ke-04",
  conceptId: "rem-rotational-ke",
  source: "CED 6.1",
  stem: "Why is $\\frac{1}{2}mv^2$, with $m$ the whole mass and $v$ the rim speed, wrong for a spinning disc?",
  options: [
    "Because it treats every gram as if it were at the rim",
    "Because a spinning disc has no translational kinetic energy at all.",
    "Because the rim speed is not a real speed.",
    "Because kinetic energy applies only to point objects."
  ],
  answer: 0,
  why: "Material near the axis moves slowly and contributes very little. $I = \\sum m_ir_i^2$ is the weighted account of where the mass actually is, and using the rim speed for all of it overstates the energy.",
  whyNot: [
    "It has none, which is why the rotational term is the whole answer — but that is not what makes the rim-speed shortcut wrong.",
    "The rim speed is perfectly real; it is just not shared by the rest of the disc.",
    "Kinetic energy applies to extended bodies too — by summing over their parts, which is what $I$ does."
  ]
},

{
  id: "qz-rem-total-kinetic-energy-01",
  conceptId: "rem-total-kinetic-energy",
  source: "CED 6.1",
  stem: "For a rolling ball you may write $\\frac{1}{2}mv^2 + \\frac{1}{2}I_{cm}\\omega^2$, or $\\frac{1}{2}I_{contact}\\omega^2$ alone. What goes wrong if you mix them?",
  options: [
    "Nothing — the two descriptions are additive.",
    "The answer comes out too small by $\\frac{1}{2}mv^2$.",
    "The answer comes out too large by exactly $\\frac{1}{2}mv^2$",
    "The units no longer work out."
  ],
  answer: 2,
  why: "The $mr^2$ in the parallel-axis term *is* the translational energy in disguise. Both descriptions are correct on their own and give the same number; what you may not do is take one and a half of them.",
  whyNot: [
    "They are two complete accounts of the same energy, not two halves of it.",
    "Double-counting makes it too large, not too small.",
    "Every term is an energy, so the units survive the error — which is what makes it hard to spot."
  ]
},
{
  id: "qz-rem-total-kinetic-energy-02",
  conceptId: "rem-total-kinetic-energy",
  source: "CED 6.1",
  stem: "A 6.0 kg bowling ball ($I_{cm} = \\frac{2}{5}mR^2$) rolls without slipping at 4.0 m/s. What is its total kinetic energy?",
  options: [
    "48 J",
    "67 J",
    "19 J",
    "120 J"
  ],
  answer: 1,
  why: "$K = \\frac{1}{2}mv^2(1 + \\beta) = \\frac{1}{2}(6.0)(16)(1.4) = 67$ J. Of that, $2/7$ — about 29% — is rotational.",
  whyNot: [
    "48 J is the translational half alone, leaving out the spin.",
    "19 J is the rotational part alone.",
    "120 J is roughly $2\\frac{1}{2}$ times the translational term and matches no correct combination."
  ]
},
{
  id: "qz-rem-total-kinetic-energy-03",
  conceptId: "rem-total-kinetic-energy",
  source: "CED 6.1",
  stem: "In $K_{tot} = \\frac{1}{2}mv_{cm}^2 + \\frac{1}{2}I_{cm}\\omega^2$, what must the $v$ and the $I$ refer to?",
  options: [
    "The speed of any point on the object, and $I$ about the contact point.",
    "The rim speed, and $I$ about the axis of rotation, wherever that is.",
    "The speed of the centre of mass, and $I$ about an axis through the centre of mass.",
    "The average speed of the object's parts, and $I$ about the pivot."
  ],
  answer: 2,
  why: "Both conditions are what make the split legitimate. Use an $I$ about any other axis and the parallel-axis term smuggles the translational energy in a second time.",
  whyNot: [
    "Different points have wildly different speeds — the contact point of a rolling wheel is momentarily at rest.",
    "The rim moves at $2v$ on a rolling wheel, and the contact axis is the double-counting case.",
    "An ‘average speed of the parts’ is not a defined quantity here."
  ]
},
{
  id: "qz-rem-total-kinetic-energy-04",
  conceptId: "rem-total-kinetic-energy",
  source: "CED 6.1",
  stem: "A grindstone spins on a fixed spindle. What is its total kinetic energy?",
  options: [
    "$\\frac{1}{2}I\\omega^2$ only",
    "$\\frac{1}{2}mv^2$ only, using the rim speed.",
    "The sum of both terms, as for any rotating object.",
    "Zero, because it is not going anywhere."
  ],
  answer: 0,
  why: "For an object rotating about a fixed axis there is no translational term to add — the centre of mass stays put. It is the mirror image of a block sliding without spinning, where only the translational term survives.",
  whyNot: [
    "The rim speed is not the centre-of-mass speed, and the centre of mass is at rest.",
    "The translational term would be zero, so adding it changes nothing but suggests the wrong picture.",
    "It has real kinetic energy — that is the point of the flywheel example."
  ]
},

{
  id: "qz-rem-work-by-torque-01",
  conceptId: "rem-work-by-torque",
  source: "CED 6.2",
  stem: "A constant 12 N$\\cdot$m torque turns a grindstone through 5.0 complete revolutions. How much work is done?",
  options: [
    "60 J",
    "$3.8 \\times 10^2$ J",
    "$2.4 \\times 10^3$ J",
    "$9.4$ J"
  ],
  answer: 1,
  why: "$\\Delta\\theta$ must be in radians: $5.0 \\times 2\\pi = 31.4$ rad, so $W = 12 \\times 31.4 = 377$ J.",
  whyNot: [
    "60 J leaves the angle in revolutions, which makes the work too small by a factor of $2\\pi$ — the standard error here.",
    "$2.4 \\times 10^3$ J is $2\\pi$ times too large, as though revolutions had been converted twice.",
    "9.4 J matches no step of this calculation."
  ]
},
{
  id: "qz-rem-work-by-torque-02",
  conceptId: "rem-work-by-torque",
  source: "CED 6.2",
  stem: "You are given a graph with torque up the side. How do you tell whether its area is work or angular impulse?",
  options: [
    "By the shape of the curve.",
    "By whether the torque is positive or negative.",
    "By the horizontal axis: angular position gives work in joules",
    "By whether the body's rotational inertia is constant."
  ],
  answer: 2,
  why: "The two graphs look identical and answer completely different questions. The units are the giveaway if you are unsure: N$\\cdot$m$\\cdot$rad is a joule, N$\\cdot$m$\\cdot$s is not.",
  whyNot: [
    "Both can be any shape at all.",
    "Sign tells you the sense, not the quantity.",
    "Constant $I$ matters for $\\tau = I\\alpha$, not for which area you are reading."
  ]
},
{
  id: "qz-rem-work-by-torque-03",
  conceptId: "rem-work-by-torque",
  source: "CED 6.2",
  stem: "Why is $W = \\tau\\Delta\\theta$ the right tool when a problem gives an angle and asks for a final angular speed?",
  options: [
    "Because it is the only equation on the sheet containing $\\tau$.",
    "Because no time appears anywhere",
    "Because $\\tau = I\\alpha$ is not valid for constant torque.",
    "Because work is a vector and can be resolved onto the axis."
  ],
  answer: 1,
  why: "The energy route skips time entirely. The force route would make you introduce a duration through $\\tau = I\\alpha$ and then eliminate it again — two extra steps for the same answer.",
  whyNot: [
    "$\\tau$ appears in several sheet equations, including $\\tau = rF\\sin\\theta$ and $\\alpha = \\tau_{net}/I$.",
    "$\\tau = I\\alpha$ is perfectly valid; it is simply the longer road here.",
    "Work is a scalar."
  ]
},
{
  id: "qz-rem-work-by-torque-04",
  conceptId: "rem-work-by-torque",
  source: "CED 6.2",
  stem: "A motor's torque does 400 J of work on a wheel while friction acts as well. What does that 400 J equal?",
  options: [
    "The wheel's change in kinetic energy.",
    "The work done by that one torque",
    "The wheel's final kinetic energy.",
    "The angular impulse delivered to the wheel."
  ],
  answer: 1,
  why: "$W = \\tau\\Delta\\theta$ evaluates one torque. With friction also acting, the change in kinetic energy is the sum of the works, and the friction term is negative.",
  whyNot: [
    "That would hold only if the motor's torque were the sole torque acting.",
    "Final kinetic energy also needs the initial value.",
    "Angular impulse is a torque times a *time*, and its units are different."
  ]
},

{
  id: "qz-rem-angular-momentum-01",
  conceptId: "rem-angular-momentum",
  source: "CED 6.3",
  stem: "A puck slides in a straight line at constant velocity across frictionless ice. What is its angular momentum about a point off to one side?",
  options: [
    "Zero, because it is not rotating.",
    "Constant and non-zero, because the perpendicular distance from the point to its path never changes.",
    "Increasing, because $r$ grows as it moves away.",
    "Undefined, since angular momentum applies only to rigid bodies."
  ],
  answer: 1,
  why: "$L = mv(r\\sin\\theta)$, and $r\\sin\\theta$ is the perpendicular miss-distance from the point to the line of travel — a fixed length. As $r$ grows, $\\sin\\theta$ shrinks by exactly the compensating amount. And with no force there is no torque, so $L$ could not change in any case.",
  whyNot: [
    "‘Not rotating’ is not the test; any object whose path misses the point has angular momentum about it.",
    "$r$ does grow, but the product that matters does not.",
    "The sheet's second expression, $L = rmv\\sin\\theta$, exists precisely for point-like objects."
  ]
},
{
  id: "qz-rem-angular-momentum-02",
  conceptId: "rem-angular-momentum",
  source: "CED 6.3",
  stem: "A 0.50 kg ball moves at 8.0 m/s in a straight line. At one instant it is 3.0 m from a point $O$, with its velocity at 30° to the line joining $O$ to the ball. What is its angular momentum about $O$?",
  options: [
    "12 kg$\\cdot$m$^2$/s",
    "10 kg$\\cdot$m$^2$/s",
    "6.0 kg$\\cdot$m$^2$/s",
    "4.0 kg$\\cdot$m$^2$/s"
  ],
  answer: 2,
  why: "$L = rmv\\sin\\theta = 3.0 \\times 0.50 \\times 8.0 \\times 0.5 = 6.0$ kg$\\cdot$m$^2$/s — and it stays at 6.0, because no torque acts.",
  whyNot: [
    "12 omits the $\\sin 30°$, which is the standard slip.",
    "10 uses $\\cos 30°$ instead, that is, the wrong pairing of angle and function.",
    "4.0 matches no grouping of these numbers."
  ]
},
{
  id: "qz-rem-angular-momentum-03",
  conceptId: "rem-angular-momentum",
  source: "CED 6.3",
  stem: "Why is ‘the ball's angular momentum is 6.0 kg$\\cdot$m$^2$/s’ an incomplete statement?",
  options: [
    "Because the units should be N$\\cdot$m$\\cdot$s.",
    "Because angular momentum is defined only relative to a stated axis or point",
    "Because a direction in space must be given.",
    "Because angular momentum must be quoted together with the rotational inertia."
  ],
  answer: 1,
  why: "Change the reference point and $r\\sin\\theta$ changes, so the value does too. An unqualified number is not yet a physical quantity — the same discipline as quoting a rotational inertia without naming an axis.",
  whyNot: [
    "kg$\\cdot$m$^2$/s is correct; N$\\cdot$m$\\cdot$s is the same combination written another way.",
    "The CED puts the vector direction of $L$ outside this course; a sign for the sense of rotation is all that is expected.",
    "$I$ is irrelevant for a point-like object treated with $L = rmv\\sin\\theta$."
  ]
},
{
  id: "qz-rem-angular-momentum-04",
  conceptId: "rem-angular-momentum",
  source: "CED 6.3",
  stem: "What does the CED say about the **direction** of angular momentum in AP Physics 1?",
  options: [
    "It must be found with the right-hand rule and quoted as a vector along the axis.",
    "It is always parallel to the velocity.",
    "It is beyond the scope of the course",
    "It reverses whenever the object crosses the reference point."
  ],
  answer: 2,
  why: "Pick one sense of rotation as positive and stay consistent. No right-hand rules, no three-dimensional vector arguments — the same boundary the CED draws for torque.",
  whyNot: [
    "The right-hand rule is explicitly outside the course.",
    "$L$ is never parallel to the velocity; it involves the perpendicular distance to the path.",
    "The sign changes if the object passes on the other side of the point, which is a fact about geometry rather than a rule about crossing."
  ]
},

{
  id: "qz-rem-angular-impulse-01",
  conceptId: "rem-angular-impulse",
  source: "CED 6.3",
  stem: "A torque grows steadily from 0 to 3.0 N$\\cdot$m over 4.0 s and then switches off. What angular impulse has it delivered?",
  options: [
    "12 kg$\\cdot$m$^2$/s",
    "6.0 kg$\\cdot$m$^2$/s",
    "0.75 kg$\\cdot$m$^2$/s",
    "3.0 kg$\\cdot$m$^2$/s"
  ],
  answer: 1,
  why: "Angular impulse is the area under the torque-time graph: $\\frac{1}{2}(4.0)(3.0) = 6.0$ kg$\\cdot$m$^2$/s. On a wheel with $I = 0.20$ kg$\\cdot$m$^2$ starting from rest, that gives $\\omega = 30$ rad/s.",
  whyNot: [
    "12 treats the peak torque as though it acted for the whole 4.0 s — the triangle read as a rectangle.",
    "0.75 divides rather than multiplies.",
    "3.0 is the peak torque itself, with no time factor."
  ]
},
{
  id: "qz-rem-angular-impulse-02",
  conceptId: "rem-angular-impulse",
  source: "CED 6.3",
  stem: "A skater changes shape while spinning. Which form of the rotational second law survives?",
  options: [
    "$\\tau_{net} = \\Delta L / \\Delta t$",
    "$\\tau_{net} = I\\alpha$, because it is the more fundamental statement.",
    "Both, since they are algebraically identical.",
    "Neither, since neither applies to a non-rigid body."
  ],
  answer: 0,
  why: "Pulling $I$ out of the rate assumes it is fixed. That assumption is exactly what a shape change breaks — and it is the reason $\\omega$ can change with no torque at all.",
  whyNot: [
    "$I\\alpha$ is the derived form, and it is the one that fails here.",
    "They are identical only when $I$ is constant, which is the whole point.",
    "The momentum form holds for non-rigid systems, which is what makes the skater analysable."
  ]
},
{
  id: "qz-rem-angular-impulse-03",
  conceptId: "rem-angular-impulse",
  source: "CED 6.3",
  stem: "On a graph of angular momentum against time, what does the slope represent?",
  options: [
    "The angular impulse.",
    "The rotational kinetic energy.",
    "The rotational inertia.",
    "The net torque."
  ],
  answer: 3,
  why: "$\\tau_{net} = \\Delta L/\\Delta t$ is a rate, so it is a slope. Slope of $L$-$t$ and area under $\\tau$-$t$ are inverse readings of the same pair of quantities, which is why they are always taught together.",
  whyNot: [
    "Angular impulse is the change in $L$ — a difference in height, or an area on the other graph.",
    "Kinetic energy would need $I$ as well, via $K = L^2/2I$.",
    "$I$ relates $L$ to $\\omega$, and no $\\omega$ axis is present."
  ]
},
{
  id: "qz-rem-angular-impulse-04",
  conceptId: "rem-angular-impulse",
  source: "CED 6.3",
  stem: "Why must the units of angular impulse match the units of angular momentum?",
  options: [
    "Because $\\Delta L = \\tau\\Delta t$ sets them equal",
    "Because both are measured about the same axis.",
    "Because both are vectors in this course.",
    "They do not — angular impulse is measured in joules."
  ],
  answer: 0,
  why: "An equation can only be written between quantities of the same dimensions, and checking that is a quick way to catch a mis-set-up problem — or to tell the two torque-graph areas apart.",
  whyNot: [
    "Sharing an axis is necessary for the comparison to mean anything but does not force the units to agree.",
    "Both carry a sign in this course, which says nothing about units.",
    "Joules belong to the torque-against-*angle* area, which is the other graph entirely."
  ]
},

{
  id: "qz-rem-conservation-angular-momentum-01",
  conceptId: "rem-conservation-angular-momentum",
  source: "CED 6.4",
  stem: "A platform with $I = 120$ kg$\\cdot$m$^2$ turns freely at 1.5 rad/s. A 30 kg child steps onto the rim at $r = 2.0$ m and stays there. What is the new angular speed?",
  options: [
    "1.5 rad/s",
    "0.75 rad/s",
    "1.2 rad/s",
    "0.375 rad/s"
  ],
  answer: 1,
  why: "$L = 120 \\times 1.5 = 180$ kg$\\cdot$m$^2$/s is unchanged, and the new rotational inertia is $120 + 30(2.0)^2 = 240$ kg$\\cdot$m$^2$. So $\\omega = 180/240 = 0.75$ rad/s.",
  whyNot: [
    "The angular speed must fall: mass was added away from the axis.",
    "1.2 rad/s would follow from adding $30 \\times 2.0$ rather than $30 \\times 2.0^2$ — the $r$ must be squared.",
    "0.375 halves the correct answer, as though the child's contribution were doubled again."
  ]
},
{
  id: "qz-rem-conservation-angular-momentum-02",
  conceptId: "rem-conservation-angular-momentum",
  source: "CED 6.4",
  stem: "Which reason for a force exerting **no** torque about an axis is correctly paired with its example?",
  options: [
    "Force acts at the axis ($r = 0$) — a merry-go-round's axle.",
    "Force acts along the radius ($\\sin\\theta = 0$) — friction on a rolling wheel.",
    "Force is parallel to the axis — the tension in a whirling string.",
    "Force is small compared with the object's weight — air resistance on a turntable."
  ],
  answer: 0,
  why: "A force applied at the axis has zero lever arm and cannot turn the system, which is why an axle can push as hard as it likes without disturbing the angular momentum about that axis.",
  whyNot: [
    "Friction on a rolling wheel acts at the rim, perpendicular to the radius — it exerts a substantial torque about the centre.",
    "The tension in a whirling string points along the radius, not parallel to the axis; the correct example of a parallel force is gravity on a horizontal turntable.",
    "Being small is not the same as being zero, and a small torque still changes $L$."
  ]
},
{
  id: "qz-rem-conservation-angular-momentum-03",
  conceptId: "rem-conservation-angular-momentum",
  source: "CED 6.4",
  stem: "How can a freely spinning system's angular speed change with no torque acting at all?",
  options: [
    "It cannot — no torque means no change of any kind.",
    "By dissipating energy to friction, which lowers $\\omega$.",
    "By changing shape: moving mass towards the axis lowers $I$",
    "By changing its total mass."
  ],
  answer: 2,
  why: "A non-rigid system can redistribute its own mass without any outside help. $L$ stays fixed because nothing external is twisting it; $\\omega$ moves because $I$ moved.",
  whyNot: [
    "No torque fixes $L$, not $\\omega$ — and those are different statements whenever $I$ can vary.",
    "Friction would be an external torque, which is the case being excluded.",
    "Mass is not created or destroyed; what changes is where it sits."
  ]
},
{
  id: "qz-rem-conservation-angular-momentum-04",
  conceptId: "rem-conservation-angular-momentum",
  source: "CED 6.4",
  stem: "Where does conservation of angular momentum come from, given that no conservation statement is printed on the equation sheet?",
  options: [
    "It is an independent law with no equation behind it.",
    "It is $\\Delta L = \\tau\\Delta t$ with $\\tau = 0$.",
    "It follows from conservation of energy.",
    "It is a special case of conservation of linear momentum."
  ],
  answer: 1,
  why: "Knowing it as a consequence rather than as a separate rule is what stops you applying it when a torque is present — the single commonest way this topic goes wrong.",
  whyNot: [
    "It has an equation behind it, and that equation is on the sheet.",
    "Energy and angular momentum are independent accounts; one can be conserved while the other is not.",
    "Linear and angular momentum are separately conserved under separate conditions."
  ]
},

{
  id: "qz-rem-l-conserved-k-not-01",
  conceptId: "rem-l-conserved-k-not",
  source: "CED 6.4",
  stem: "A skater spinning freely halves her rotational inertia. What happens to her angular speed and her kinetic energy?",
  options: [
    "$\\omega$ doubles; $K$ is unchanged, because no external torque acted.",
    "$\\omega$ doubles; $K$ doubles, and the extra energy came from her muscles.",
    "$\\omega$ halves; $K$ halves.",
    "$\\omega$ doubles; $K$ quadruples."
  ],
  answer: 1,
  why: "$L = I\\omega$ is fixed, so $\\omega$ doubles. Then $K = L^2/2I$ doubles as $I$ halves — and the work was done by her arms, pulling inward through an inward displacement.",
  whyNot: [
    "Conserved $L$ does not imply conserved $K$; they are independent accounts.",
    "Lowering $I$ raises $\\omega$, not lowers it.",
    "$K$ picks up four from $\\omega^2$ and loses two from $I$, so the net factor is two."
  ]
},
{
  id: "qz-rem-l-conserved-k-not-02",
  conceptId: "rem-l-conserved-k-not",
  source: "CED 6.4",
  stem: "A lump of clay lands on a spinning turntable and sticks. A student conserves kinetic energy to find the new $\\omega$. What is wrong?",
  options: [
    "Nothing, provided the axle is frictionless.",
    "They should conserve angular momentum: kinetic energy is dissipated as the clay skids into place",
    "They should conserve linear momentum instead.",
    "The method is right but needs the clay's rotational inertia about its own centre."
  ],
  answer: 1,
  why: "It is the rotational twin of a perfectly inelastic linear collision. The energy route gives too high an angular speed, and the algebra looks perfectly respectable while it does so.",
  whyNot: [
    "A frictionless axle removes external torque, which protects $L$ — not $K$, which is lost to friction *between the clay and the turntable*.",
    "Linear momentum is not conserved here: the axle exerts whatever force it needs to.",
    "The clay's own spin is a detail; the error is the conservation law chosen."
  ]
},
{
  id: "qz-rem-l-conserved-k-not-03",
  conceptId: "rem-l-conserved-k-not",
  source: "CED 6.4",
  stem: "At fixed angular momentum, how does kinetic energy depend on rotational inertia?",
  options: [
    "$K \\propto I$, so a larger $I$ stores more energy.",
    "$K \\propto I^2$.",
    "$K \\propto 1/I$, from $K = L^2/2I$.",
    "$K$ does not depend on $I$ once $L$ is fixed."
  ],
  answer: 2,
  why: "Substitute $\\omega = L/I$ into $K = \\frac{1}{2}I\\omega^2$. It is one line from two sheet equations and makes the whole topic obvious: halve $I$ and you double $K$.",
  whyNot: [
    "That is the dependence at fixed $\\omega$, not at fixed $L$ — and which is fixed is exactly what the problem tells you.",
    "No such dependence arises.",
    "$K$ depends on both, and holding $L$ fixed is what isolates the $I$ dependence."
  ]
},
{
  id: "qz-rem-l-conserved-k-not-04",
  conceptId: "rem-l-conserved-k-not",
  source: "CED 6.4",
  stem: "How do you decide whether kinetic energy is conserved in a rotational interaction?",
  options: [
    "Ask whether any agent inside the system did work or dissipated energy",
    "Ask whether the net external torque is zero.",
    "Ask whether the rotational inertia increased or decreased.",
    "Assume it is conserved unless the problem says otherwise."
  ],
  answer: 0,
  why: "Angular momentum cares only about external torques; energy cares about work and dissipation inside. Two independent questions, and answering one does not answer the other.",
  whyNot: [
    "That is the test for angular momentum, not for energy.",
    "The direction of the change tells you which way $K$ moved, not whether it was conserved.",
    "The safe habit is the opposite: compute $K$ twice and compare, never carry it across."
  ]
},

{
  id: "qz-rem-rolling-without-slipping-01",
  conceptId: "rem-rolling-without-slipping",
  source: "CED 6.5",
  stem: "A wheel of radius 0.35 m rolls without slipping with its centre moving at 4.0 m/s. How fast is the topmost point moving?",
  options: [
    "4.0 m/s",
    "8.0 m/s",
    "2.0 m/s",
    "11 m/s"
  ],
  answer: 1,
  why: "At the top, the translational velocity and the rotational velocity point the same way and add: $v + \\omega r = 2v = 8.0$ m/s. At the contact point they oppose and cancel exactly, which is why that point is instantaneously at rest.",
  whyNot: [
    "4.0 m/s is the centre's speed; every other point differs.",
    "2.0 m/s is half the centre's speed and matches no point on the wheel.",
    "11 is the angular speed in rad/s, not a linear speed."
  ]
},
{
  id: "qz-rem-rolling-without-slipping-02",
  conceptId: "rem-rolling-without-slipping",
  source: "CED 6.5",
  stem: "Friction acts on a ball rolling without slipping. Why does it dissipate no energy, even though it can exert a torque?",
  options: [
    "Because static friction is always smaller than kinetic friction.",
    "Because the friction force is perpendicular to the motion.",
    "Because it is static friction applied at a point that is instantaneously at rest relative to the ground, so nothing slides.",
    "Because the ball is rigid and cannot deform."
  ],
  answer: 2,
  why: "A force dissipates energy only when its point of application slides through a displacement on the surface. This is the licence that makes energy conservation usable for rolling problems.",
  whyNot: [
    "Static friction is typically the larger of the two, and size is not the issue.",
    "Friction acts along the surface, in the direction of travel — not perpendicular to it.",
    "Rigidity rules out other losses but is not why this force does no work."
  ]
},
{
  id: "qz-rem-rolling-without-slipping-03",
  conceptId: "rem-rolling-without-slipping",
  source: "CED 6.5",
  stem: "A wheel spins on ice and goes nowhere. What can you say about $v$ and $\\omega$?",
  options: [
    "$v = r\\omega$ still holds, with $v$ very small.",
    "$\\omega = 0$, since the wheel is not advancing.",
    "$v$ and $\\omega$ are proportional but with a different constant.",
    "Nothing relates them: slipping removes the constraint entirely"
  ],
  answer: 3,
  why: "The CED is explicit that when a body slips, the centre-of-mass motion and the rotation cannot be related. A spinning wheel on ice has a large $\\omega$ and $v \\approx 0$ — the clearest possible counterexample to $v = r\\omega$.",
  whyNot: [
    "$v \\approx 0$ with a large $\\omega$ is exactly what $v = r\\omega$ forbids.",
    "The wheel is spinning fast; it is the advance that has stopped.",
    "There is no constant at all — the two are independent while slipping."
  ]
},
{
  id: "qz-rem-rolling-without-slipping-04",
  conceptId: "rem-rolling-without-slipping",
  source: "CED 6.5",
  stem: "What does the CED place **outside** the course in this topic?",
  options: [
    "Rolling friction from a deforming tyre",
    "The relation $v_{cm} = r\\omega$ for rolling without slipping.",
    "The claim that the contact point is instantaneously at rest.",
    "Energy conservation for a rolling body."
  ],
  answer: 0,
  why: "You are expected to describe qualitatively what happens while a wheel slips — kinetic friction slows the spin and speeds the slide until $v = r\\omega$ and rolling begins — but not to compute it.",
  whyNot: [
    "That relation is on the equation sheet and is central to the topic.",
    "That is the key fact that makes the friction static.",
    "Energy conservation for rolling is exactly what this concept licenses."
  ]
},

{
  id: "qz-rem-rolling-energy-01",
  conceptId: "rem-rolling-energy",
  source: "CED 6.5",
  stem: "A hoop and a disc are released together at the top of a ramp and roll without slipping. Which reaches the bottom first, and why?",
  options: [
    "The hoop, because more of its mass is at the rim and it carries more momentum.",
    "The disc, because a larger share of the hoop's energy budget is locked into its spin.",
    "They arrive together, because mass and radius cancel.",
    "Whichever is heavier, since a heavier body converts more potential energy."
  ],
  answer: 1,
  why: "$v = \\sqrt{2gh/(1+\\beta)}$, and $\\beta = 1$ for a hoop against $\\frac{1}{2}$ for a disc. Larger $\\beta$ means more of the same energy per kilogram goes into rotation and less into travelling.",
  whyNot: [
    "Carrying more momentum is not what decides arrival; the hoop is slower.",
    "Mass and radius do cancel — but $\\beta$ does not, and it differs between the shapes.",
    "Mass cancels entirely: a hoop three times as heavy arrives at exactly the same speed as a light one."
  ]
},
{
  id: "qz-rem-rolling-energy-02",
  conceptId: "rem-rolling-energy",
  source: "CED 6.5",
  stem: "A uniform disc ($\\beta = \\frac{1}{2}$) rolls without slipping from rest down a 1.5 m drop. What is its speed at the bottom? Use $g = 9.8$ m/s$^2$.",
  options: [
    "5.4 m/s",
    "3.8 m/s",
    "4.4 m/s",
    "2.9 m/s"
  ],
  answer: 2,
  why: "$v = \\sqrt{\\frac{2gh}{1+\\beta}} = \\sqrt{\\frac{29.4}{1.5}} = 4.4$ m/s. A hoop over the same drop manages only 3.8 m/s, and a frictionless sliding block 5.4 m/s.",
  whyNot: [
    "5.4 m/s is $\\sqrt{2gh}$ — the sliding answer, which gives the rotational share to the translation.",
    "3.8 m/s is the hoop's answer, with $\\beta = 1$.",
    "2.9 m/s corresponds to no $\\beta$ in the range of real shapes."
  ]
},
{
  id: "qz-rem-rolling-energy-03",
  conceptId: "rem-rolling-energy",
  source: "CED 6.5",
  stem: "Why do the mass and the radius drop out of a rolling-from-rest problem?",
  options: [
    "Because gravity acts equally on all objects.",
    "Because $I = \\beta mr^2$ meets $\\omega^2 = v^2/r^2$",
    "Because the rotational term is negligible.",
    "Because rolling friction is proportional to both."
  ],
  answer: 1,
  why: "$mgh = \\frac{1}{2}mv^2(1+\\beta)$ after the substitution. That cancellation is the algebraic content of ‘mass and radius do not matter’, and it is worth doing once rather than memorising the conclusion.",
  whyNot: [
    "The gravitational force is proportional to mass, and it is the algebra that removes it.",
    "The rotational term is a third of the total for a disc — not negligible at all.",
    "Rolling friction is outside the course, and is not why these cancel."
  ]
},
{
  id: "qz-rem-rolling-energy-04",
  conceptId: "rem-rolling-energy",
  source: "CED 6.5",
  stem: "For ‘how fast is it at the bottom of the ramp’, why choose energy over forces?",
  options: [
    "Because forces cannot be used for a rolling body.",
    "Because energy gives the friction force directly.",
    "Because energy needs one equation and does not care about the ramp's shape; the force route needs a diagram, a torque equation, the rolling constraint, simultaneous equations and then kinematics.",
    "Because the acceleration is not constant on a straight ramp."
  ],
  answer: 2,
  why: "Use forces when the question actually asks for the friction force or the acceleration. For a speed after a known drop, energy is one line.",
  whyNot: [
    "Forces work perfectly well; they are simply five steps rather than one.",
    "It is the force route that yields the friction force; energy never mentions it, because static friction does no work.",
    "On a straight ramp the acceleration is constant — the objection to the force route is length, not validity."
  ]
},

{
  id: "qz-rem-orbital-motion-01",
  conceptId: "rem-orbital-motion",
  source: "CED 6.6",
  stem: "Which quantities are constant for a satellite in an **elliptical** orbit?",
  options: [
    "Total mechanical energy and angular momentum only.",
    "Kinetic energy and angular momentum.",
    "All of energy, potential energy, kinetic energy and angular momentum.",
    "Speed and angular momentum."
  ],
  answer: 0,
  why: "Potential and kinetic energy trade off against each other as the radius changes, so neither is constant on its own. A circular orbit holds all four steady; an ellipse holds only these two.",
  whyNot: [
    "Kinetic energy rises near the central body and falls far from it.",
    "That is the circular-orbit list.",
    "The constancy of $L$ with a changing radius *requires* the speed to change."
  ]
},
{
  id: "qz-rem-orbital-motion-02",
  conceptId: "rem-orbital-motion",
  source: "CED 6.6",
  stem: "Why is a satellite's angular momentum about the central body constant even on a stretched ellipse?",
  options: [
    "Because gravity is a conservative force.",
    "Because gravity always points along the line joining the two bodies, so $\\sin\\theta = 0$ and the torque about that body is zero.",
    "Because the satellite's mass does not change.",
    "Because the orbit is a closed path."
  ],
  answer: 1,
  why: "No torque, no change in $L$ — the same argument as the free particle sliding past a point. Conservative-ness is what protects the *energy*; the geometry of a central force is what protects the angular momentum.",
  whyNot: [
    "Being conservative protects mechanical energy, which is a separate account.",
    "Constant mass is necessary for $L = I\\omega$ to be simple but does not stop a torque acting.",
    "Closed paths are not the criterion; an unbound hyperbolic path conserves $L$ too."
  ]
},
{
  id: "qz-rem-orbital-motion-03",
  conceptId: "rem-orbital-motion",
  source: "CED 6.6",
  stem: "A satellite orbits a planet of mass $6.0 \\times 10^{24}$ kg at a radius of $7.0 \\times 10^6$ m. What is its orbital speed, and what would it need to escape from that radius?",
  options: [
    "$7.6 \\times 10^3$ m/s to orbit; the same speed to escape.",
    "$7.6 \\times 10^3$ m/s to orbit; $1.5 \\times 10^4$ m/s to escape.",
    "$7.6 \\times 10^3$ m/s to orbit; $1.07 \\times 10^4$ m/s to escape.",
    "$5.7 \\times 10^7$ m/s to orbit; twice that to escape."
  ],
  answer: 2,
  why: "$v = \\sqrt{GM/r} = 7.6 \\times 10^3$ m/s, and escape is $\\sqrt{2}$ times that — $1.07 \\times 10^4$ m/s. Both are independent of the satellite's own mass, which cancels in each derivation.",
  whyNot: [
    "Escaping needs more speed than orbiting; at the orbital speed the satellite stays bound.",
    "$1.5 \\times 10^4$ is twice the orbital speed, not $\\sqrt{2}$ times it.",
    "$5.7 \\times 10^7$ is $GM/r$ before the square root — a velocity squared."
  ]
},
{
  id: "qz-rem-orbital-motion-04",
  conceptId: "rem-orbital-motion",
  source: "CED 6.6",
  stem: "A student's free-body diagram for an orbiting satellite shows gravity and, alongside it, a centripetal force arrow. What is wrong?",
  options: [
    "The centripetal arrow should point outwards.",
    "It counts the same pull twice: ‘centripetal’ names the role a net force plays, and gravity fills that role by itself.",
    "Gravity should not appear, since the satellite is weightless.",
    "Nothing — both forces act on an orbiting satellite."
  ],
  answer: 1,
  why: "The diagram has exactly one arrow. Gravity *is* the centripetal force here, and drawing a second inward arrow doubles the net force and would halve the orbital radius the numbers predict.",
  whyNot: [
    "An outward arrow is worse still — there is no centrifugal force in an inertial frame.",
    "Weightlessness is the absence of a normal force, not of gravity; gravity is what holds the orbit.",
    "Only one force acts."
  ]
},

/* ---- Unit 7 · Oscillations ------------------------------------------------ */

{
  id: "qz-osc-restoring-force-01",
  conceptId: "osc-restoring-force",
  source: "CED 7.1",
  stem: "What is the defining condition for simple harmonic motion?",
  options: [
    "The motion repeats at regular intervals.",
    "The net force is a restoring force proportional to the displacement from equilibrium and directed back towards it.",
    "The speed is greatest at the extremes of the motion.",
    "The acceleration is constant in magnitude."
  ],
  answer: 1,
  why: "$F_{net} = -k\\Delta x$, so $a_x = -(k/m)\\Delta x$. Everything else in the unit — the sinusoid, the period, the phase relationships — follows from that one sentence.",
  whyNot: [
    "Periodicity is necessary but nothing like sufficient: a ball bouncing between two walls repeats and is not SHM.",
    "The speed is greatest at equilibrium and zero at the extremes.",
    "The acceleration varies continuously, being proportional to the displacement."
  ]
},
{
  id: "qz-osc-restoring-force-02",
  conceptId: "osc-restoring-force",
  source: "CED 7.1",
  stem: "A ball bounces elastically between two walls at constant speed. Why is this periodic motion **not** simple harmonic?",
  options: [
    "Because it loses energy at each wall.",
    "Because its period depends on the ball's mass.",
    "Because the restoring force is zero in the middle and enormous for an instant at each wall, rather than proportional to displacement.",
    "Because the motion is one-dimensional."
  ],
  answer: 2,
  why: "SHM requires the force to grow smoothly with displacement. Here the position-time graph is a zigzag rather than a sinusoid, and unlike a true oscillator the period changes with speed.",
  whyNot: [
    "The collisions are stated to be elastic, so no energy is lost.",
    "The mass does not appear in the period of this motion at all.",
    "SHM is usually one-dimensional; that is not what disqualifies it."
  ]
},
{
  id: "qz-osc-restoring-force-03",
  conceptId: "osc-restoring-force",
  source: "CED 7.1",
  stem: "A 0.50 kg mass on a spring with $k = 20$ N/m sits 0.080 m from equilibrium. What is its acceleration there?",
  options: [
    "1.6 m/s$^2$",
    "3.2 m/s$^2$",
    "0.32 m/s$^2$",
    "40 m/s$^2$"
  ],
  answer: 1,
  why: "$a = (k/m)\\Delta x = 40 \\times 0.080 = 3.2$ m/s$^2$, directed towards equilibrium. Halve the displacement and the acceleration halves exactly — that proportionality is the definition at work.",
  whyNot: [
    "1.6 m/s$^2$ is the value at half this displacement.",
    "0.32 is out by a factor of ten.",
    "40 is $k/m$ itself, in s$^{-2}$, before multiplying by the displacement."
  ]
},
{
  id: "qz-osc-restoring-force-04",
  conceptId: "osc-restoring-force",
  source: "CED 7.1",
  stem: "In $F = -k\\Delta x$, what is $\\Delta x$ measured from?",
  options: [
    "The origin of whatever coordinate system the diagram uses.",
    "The wall the spring is attached to.",
    "The spring's natural length, always.",
    "The equilibrium position, where the net force on the object is zero."
  ],
  answer: 3,
  why: "For a horizontal spring that is the natural length, but for a mass hanging on a spring it is the new resting point a distance $mg/k$ lower. If the problem measures position from a wall, convert first.",
  whyNot: [
    "The diagram's origin is arbitrary and often somewhere else entirely.",
    "Measuring from the wall gives the spring's length, not the displacement.",
    "For a vertical spring the equilibrium point is *not* at the natural length, which is the whole subtlety of that case."
  ]
},

{
  id: "qz-osc-period-frequency-01",
  conceptId: "osc-period-frequency",
  source: "CED 7.2",
  stem: "A graph of an oscillation shows the mass moving between extremes 6.0 cm apart. What is the amplitude?",
  options: [
    "6.0 cm",
    "3.0 cm",
    "12 cm",
    "1.5 cm"
  ],
  answer: 1,
  why: "Amplitude is the maximum displacement from equilibrium in one direction. The 6.0 cm figure is peak-to-peak, which is $2A$.",
  whyNot: [
    "Reading peak-to-peak as $A$ is the standard amplitude error.",
    "12 cm doubles the peak-to-peak distance.",
    "1.5 cm quarters it."
  ]
},
{
  id: "qz-osc-period-frequency-02",
  conceptId: "osc-period-frequency",
  source: "CED 7.2",
  stem: "A mass completes 24 full cycles in 15.0 s. What are its frequency and period?",
  options: [
    "$f = 1.60$ Hz, $T = 0.625$ s",
    "$f = 0.625$ Hz, $T = 1.60$ s",
    "$f = 24$ Hz, $T = 15.0$ s",
    "$f = 1.60$ Hz, $T = 10.1$ s"
  ],
  answer: 0,
  why: "$f = 24/15.0 = 1.60$ Hz and $T = 1/f = 0.625$ s. Its angular frequency, $2\\pi f$, is 10.1 rad/s — a different quantity with different units.",
  whyNot: [
    "This swaps the two: the period is the smaller number when there is more than one cycle per second.",
    "24 cycles is a count, not a rate, and 15.0 s is the whole run, not one cycle.",
    "10.1 is the angular frequency in rad/s, not a period."
  ]
},
{
  id: "qz-osc-period-frequency-03",
  conceptId: "osc-period-frequency",
  source: "CED 7.2",
  stem: "Which relation is angular frequency?",
  options: [
    "$\\omega = f$",
    "$\\omega = 2\\pi/f$",
    "$\\omega = 2\\pi f = 2\\pi/T$",
    "$\\omega = f/2\\pi$"
  ],
  answer: 2,
  why: "It is the quantity sitting inside the bracket of $x = A\\cos(2\\pi ft)$, and the $2\\pi$ is a conversion between cycles and radians: one full cycle advances the cosine's argument by $2\\pi$.",
  whyNot: [
    "That would make radians per second and cycles per second the same number.",
    "$2\\pi/f$ is $2\\pi T$, which is not a standard quantity at all.",
    "This divides where it should multiply."
  ]
},
{
  id: "qz-osc-period-frequency-04",
  conceptId: "osc-period-frequency",
  source: "CED 7.2",
  stem: "Which of amplitude, period, frequency and angular frequency carries information independent of the others?",
  options: [
    "Amplitude — the other three are three names for one piece of information.",
    "Period, since frequency and angular frequency are both derived from it.",
    "Frequency, since it is the one the equation sheet prints.",
    "None — all four are fixed once the oscillator is built."
  ],
  answer: 0,
  why: "Give any one of $T$, $f$ or $\\omega$ and the other two follow immediately. Amplitude can be set to anything you like without touching them, though it does control the energy.",
  whyNot: [
    "Period is one of the three interchangeable names, not the independent one.",
    "The sheet prints $T = 1/f$, which relates them rather than privileging either.",
    "Amplitude is a free choice for an ideal oscillator, which is exactly why it is the independent one."
  ]
},

{
  id: "qz-osc-spring-period-01",
  conceptId: "osc-spring-period",
  source: "CED 7.2",
  stem: "A mass hangs vertically from a spring instead of resting on a horizontal table. Does gravity change the period?",
  options: [
    "Yes — gravity adds to the restoring force, so $g$ enters the period.",
    "Yes — the period is longer by a factor of $\\sqrt{1 + g/k}$.",
    "No — gravity shifts the equilibrium down by $mg/k$ and then cancels out of the restoring force entirely.",
    "No, but only if the spring is very stiff."
  ],
  answer: 2,
  why: "Measure displacement from the *new* equilibrium and the net force is again $-k\\Delta x$: the constant weight and the constant part of the spring force cancel identically at every position. Same $m$, same $k$, same $T = 2\\pi\\sqrt{m/k}$, with no $g$ in it.",
  whyNot: [
    "This is the tempting wrong answer, and it mistakes a constant force for part of the restoring force.",
    "No such factor exists, and it is not even dimensionally sound.",
    "Stiffness changes the period through $k$, but the cancellation of gravity holds for any spring."
  ]
},
{
  id: "qz-osc-spring-period-02",
  conceptId: "osc-spring-period",
  source: "CED 7.2",
  stem: "By what factor must the mass on a spring be multiplied to double the period?",
  options: [
    "2",
    "4",
    "$\\sqrt{2}$",
    "8"
  ],
  answer: 1,
  why: "$T \\propto \\sqrt{m}$, so quadrupling the mass doubles the period. A 0.25 kg block on a 40 N/m spring gives 0.50 s; a 1.00 kg block on the same spring gives 0.99 s.",
  whyNot: [
    "Doubling the mass raises the period only by $\\sqrt{2}$ — the standard error is treating the dependence as linear.",
    "$\\sqrt{2}$ times the mass raises the period by about 19%.",
    "Eight times the mass gives $2\\sqrt{2}$ times the period."
  ]
},
{
  id: "qz-osc-spring-period-03",
  conceptId: "osc-spring-period",
  source: "CED 7.2",
  stem: "Which two quantities are **absent** from $T_s = 2\\pi\\sqrt{m/k}$, and why does each absence matter?",
  options: [
    "Amplitude and $g$: pulling the mass further out does not change the timing",
    "Mass and $g$: neither the load nor the location affects an ideal spring.",
    "Amplitude and $k$: the stiffness cancels for an ideal spring.",
    "Time and frequency, which appear only in $T = 1/f$."
  ],
  answer: 0,
  why: "Dimensional analysis explains both absences: $\\sqrt{m/k}$ is the only time you can build from the system's properties, and there is no second length for the amplitude to form a ratio with.",
  whyNot: [
    "The mass is very much present, and it is the main lever on the period.",
    "$k$ is present too — it is what makes a stiff spring fast.",
    "Frequency is just $1/T$, and time is what the formula produces."
  ]
},
{
  id: "qz-osc-spring-period-04",
  conceptId: "osc-spring-period",
  source: "CED 7.2",
  stem: "A 0.25 kg block on a spring with $k = 40$ N/m oscillates with amplitude 0.10 m. The experiment is repeated with a 1.00 kg block and an amplitude of 0.20 m. How do the periods compare?",
  options: [
    "The second is four times the first, because both the mass and the amplitude doubled the effect.",
    "The second is twice the first: the amplitude is irrelevant and the mass is four times larger.",
    "They are equal, since the extra amplitude compensates for the extra mass.",
    "The second is $\\sqrt{2}$ times the first."
  ],
  answer: 1,
  why: "$T = 2\\pi\\sqrt{m/k}$ gives 0.50 s and 0.99 s. Amplitude never appears, so the doubled release distance changes nothing about the timing — only the energy and the maximum speed.",
  whyNot: [
    "Amplitude contributes nothing, so there is no second factor to compound.",
    "Amplitude cannot compensate for anything, since it is absent from the formula.",
    "$\\sqrt{2}$ would follow from doubling the mass, not quadrupling it."
  ]
},

{
  id: "qz-osc-pendulum-period-01",
  conceptId: "osc-pendulum-period",
  source: "CED 7.2",
  stem: "A pendulum's 50 g bob is replaced by a 200 g bob of the same size. What happens to the period?",
  options: [
    "It doubles.",
    "It halves.",
    "It is unchanged — the bob's mass does not appear in $T_p = 2\\pi\\sqrt{\\ell/g}$.",
    "It rises by a factor of $\\sqrt{2}$."
  ],
  answer: 2,
  why: "A heavier bob feels a proportionally larger restoring force and has proportionally more inertia, and the two cancel exactly — the same cancellation that makes heavy and light objects fall together.",
  whyNot: [
    "Mass raises the period for a *spring*, not for a pendulum; do not carry one formula's dependence into the other.",
    "Nothing in this change shortens the period.",
    "No mass dependence exists at all, of any power."
  ]
},
{
  id: "qz-osc-pendulum-period-02",
  conceptId: "osc-pendulum-period",
  source: "CED 7.2",
  stem: "A pendulum is taken to a place where $g$ is one quarter of Earth's. Its period is multiplied by what factor?",
  options: [
    "$\\frac{1}{4}$",
    "2",
    "4",
    "$\\frac{1}{2}$"
  ],
  answer: 1,
  why: "$T_p \\propto 1/\\sqrt{g}$, so a quarter of the field strength doubles the period. The same relation says quadrupling the length also doubles it.",
  whyNot: [
    "A weaker field makes the pendulum slower, not four times faster.",
    "4 would follow if $T \\propto 1/g$, without the square root.",
    "Halving the period would need a *stronger* field."
  ]
},
{
  id: "qz-osc-pendulum-period-03",
  conceptId: "osc-pendulum-period",
  source: "CED 7.2",
  stem: "Where is $\\ell$ measured to, in $T_p = 2\\pi\\sqrt{\\ell/g}$?",
  options: [
    "From the pivot to the centre of the bob.",
    "From the pivot to the top of the bob.",
    "The length of string, before the bob is attached.",
    "The horizontal distance swept by the bob."
  ],
  answer: 0,
  why: "The bob is modelled as a point at its centre of mass, so the swing radius runs to that point. Measuring to the top of a large bob systematically shortens $\\ell$ and biases any $g$ measured from it.",
  whyNot: [
    "This is the standard measurement error, and it makes $\\ell$ too small by the bob's radius.",
    "The string alone stops at the top of the bob, which is the same error.",
    "The swept distance depends on the amplitude, which does not enter the period at all."
  ]
},
{
  id: "qz-osc-pendulum-period-04",
  conceptId: "osc-pendulum-period",
  source: "CED 7.2",
  stem: "Contrast what appears in the spring period with what appears in the pendulum period.",
  options: [
    "Both contain $m$; only the pendulum contains $g$.",
    "The spring period contains $m$ and $k$ but no $g$",
    "Both contain $g$; only the spring contains $m$.",
    "Both contain the amplitude, which is why both are called oscillators."
  ],
  answer: 1,
  why: "They are near mirror images, which is why checking which formula you are in is worth a second. Putting the bob's mass into the pendulum period, or $g$ into the spring period, is the standard cross-contamination.",
  whyNot: [
    "The pendulum period has no mass in it.",
    "The spring period has no $g$ in it.",
    "Neither contains the amplitude — that is what makes both isochronous."
  ]
},

{
  id: "qz-osc-small-angle-01",
  conceptId: "osc-small-angle",
  source: "CED 7.1",
  stem: "What approximation makes a pendulum count as a simple harmonic oscillator?",
  options: [
    "That the string is massless.",
    "That air resistance is negligible.",
    "That $\\sin\\theta \\approx \\theta$",
    "That the bob is a point mass."
  ],
  answer: 2,
  why: "Gravity supplies a restoring torque proportional to $\\sin\\theta$; SHM requires one proportional to $\\theta$. For small angles the two agree, which is why the CED says a pendulum at small displacement can be *modelled as* SHM.",
  whyNot: [
    "A massless string simplifies the geometry but does not make the restoring torque proportional.",
    "Neglecting drag keeps the amplitude constant; it does nothing about proportionality.",
    "The point-mass model fixes where $\\ell$ is measured to, and again is not the issue."
  ]
},
{
  id: "qz-osc-small-angle-02",
  conceptId: "osc-small-angle",
  source: "CED 7.1",
  stem: "At large release angles, is a real pendulum's period longer or shorter than $2\\pi\\sqrt{\\ell/g}$?",
  options: [
    "Longer, because $\\sin\\theta < \\theta$ always",
    "Shorter, because the bob travels faster at large amplitude.",
    "Unchanged, because amplitude never affects a period.",
    "It depends on the mass of the bob."
  ],
  answer: 0,
  why: "The discrepancy always has the same sign, so the correction always goes one way: a slower return, hence a longer period. It is about 5% at 30° and about 17% at 60°.",
  whyNot: [
    "It does travel faster, and it also has much further to go; the net effect is a longer period.",
    "Amplitude-independence is a property of *simple harmonic* motion, which is exactly what fails at large angle.",
    "Mass drops out at any amplitude."
  ]
},
{
  id: "qz-osc-small-angle-03",
  conceptId: "osc-small-angle",
  source: "CED 7.1",
  stem: "A student tests $\\sin\\theta \\approx \\theta$ at 30° by comparing 0.5 with 30 and concludes the approximation is hopeless. What went wrong?",
  options: [
    "The comparison should be made with $\\cos\\theta$.",
    "The angle was left in degrees: 30° is 0.524 rad",
    "The approximation applies only above 45°.",
    "$\\sin 30°$ is not 0.5."
  ],
  answer: 1,
  why: "The approximation holds only in radians — it is the first term of the sine's expansion in radians. A calculator left in degree mode produces plausible-looking nonsense here.",
  whyNot: [
    "Cosine plays no part in this approximation.",
    "It gets *worse* as the angle grows, not better.",
    "$\\sin 30° = 0.5$ exactly, and it is on the sheet's trigonometry table."
  ]
},
{
  id: "qz-osc-small-angle-04",
  conceptId: "osc-small-angle",
  source: "CED 7.1",
  stem: "You are measuring $g$ from a pendulum's period. Why does a large release angle matter?",
  options: [
    "It does not, since amplitude never affects the period.",
    "It adds random scatter, which averaging over many trials removes.",
    "It biases the result: the period comes out too long",
    "It makes the period too short, so $g$ comes out too large."
  ],
  answer: 2,
  why: "The error is one-directional, so it is a bias rather than noise, and no amount of repetition removes it. The same care applies when testing the claim that the period is amplitude-independent — outside the small-angle regime you would ‘disprove’ a rule whose conditions you never met.",
  whyNot: [
    "Amplitude-independence holds only within the approximation, which a large angle breaks.",
    "Systematic errors survive averaging; that is what distinguishes them from random ones.",
    "The period is too long, not too short, because $\\sin\\theta$ falls short of $\\theta$."
  ]
},

{
  id: "qz-osc-position-time-01",
  conceptId: "osc-position-time",
  source: "CED 7.3",
  stem: "A block is pulled 0.12 m to the right and released from rest at $t = 0$, oscillating at 2.5 Hz. Which equation describes it?",
  options: [
    "$x = 0.12\\sin(5\\pi t)$",
    "$x = 0.12\\cos(5\\pi t)$",
    "$x = 0.24\\cos(2.5t)$",
    "$x = 0.12\\cos(2.5t)$"
  ],
  answer: 1,
  why: "Released from rest at maximum displacement means $x = +A$ at $t = 0$, which is the cosine form. The argument is $2\\pi ft = 2\\pi(2.5)t = 5\\pi t$.",
  whyNot: [
    "The sine form starts at $x = 0$ moving positively — the other initial condition.",
    "0.24 m is the peak-to-peak distance, and the argument is missing its $2\\pi$.",
    "Using $2.5t$ leaves out the $2\\pi$ that converts cycles to radians."
  ]
},
{
  id: "qz-osc-position-time-02",
  conceptId: "osc-position-time",
  source: "CED 7.3",
  stem: "Starting from $x = +A$, where is the oscillator at $t = T/4$ and at $t = T/2$?",
  options: [
    "At $x = A/2$, then at $x = 0$.",
    "At $x = 0$ passing through equilibrium, then at $x = -A$.",
    "At $x = -A$, then back at $x = +A$.",
    "At $x = 0$, then back at $x = +A$."
  ],
  answer: 1,
  why: "The cosine's argument reaches $\\pi/2$ at $T/4$ and $\\pi$ at $T/2$. A full cycle returns to $+A$ only at $t = T$ — which is why timing from one extreme to the other gives $T/2$, not $T$.",
  whyNot: [
    "$x = A/2$ occurs at $T/6$, not at a quarter period.",
    "$-A$ arrives at the half period, not the quarter.",
    "Returning to $+A$ at the half period would halve the period."
  ]
},
{
  id: "qz-osc-position-time-03",
  conceptId: "osc-position-time",
  source: "CED 7.3",
  stem: "How does doubling the amplitude change a position-time graph?",
  options: [
    "The peaks become twice as tall; their spacing along the time axis is unchanged.",
    "The peaks become twice as tall and twice as far apart.",
    "The peaks stay the same height and become twice as far apart.",
    "The graph shifts upwards by $A$."
  ],
  answer: 0,
  why: "Amplitude stretches the curve vertically only — the graphical form of ‘amplitude does not change the period’.",
  whyNot: [
    "Doubling the spacing would double the period, which amplitude cannot do.",
    "The height is exactly what amplitude changes.",
    "A vertical shift would move the equilibrium position, which is a different change entirely."
  ]
},
{
  id: "qz-osc-position-time-04",
  conceptId: "osc-position-time",
  source: "CED 7.3",
  stem: "Which error does a calculator left in degree mode produce when evaluating $x = A\\cos(2\\pi ft)$?",
  options: [
    "An error message, since the argument is dimensionless.",
    "A plausible-looking number that is wrong",
    "The right answer with the wrong sign.",
    "An amplitude that is too large by $2\\pi$."
  ],
  answer: 1,
  why: "This is the one place in the unit where calculator mode genuinely matters. The argument $2\\pi ft$ is a pure number in radians, and reading it as degrees returns a value in range and entirely wrong.",
  whyNot: [
    "Calculators happily evaluate any number in either mode; nothing flags it.",
    "The error is not a sign flip — the value is simply taken from the wrong point on the curve.",
    "The amplitude multiplies the cosine and is unaffected."
  ]
},

{
  id: "qz-osc-phase-relationships-01",
  conceptId: "osc-phase-relationships",
  source: "CED 7.3",
  stem: "Where in the motion is the speed greatest, and where is the acceleration greatest?",
  options: [
    "Both at the turning points.",
    "Both at equilibrium.",
    "Speed at equilibrium, acceleration at the turning points.",
    "Speed at the turning points, acceleration at equilibrium."
  ],
  answer: 2,
  why: "$a_x = -(k/m)x$, so the acceleration is largest where the displacement is — at $x = \\pm A$, where the speed is zero. The speed peaks at $x = 0$, where the acceleration vanishes.",
  whyNot: [
    "At the turning points the object is momentarily at rest.",
    "At equilibrium the net force is zero, so the acceleration is zero.",
    "This is the exact reversal, and it is the single most common Unit 7 error."
  ]
},
{
  id: "qz-osc-phase-relationships-02",
  conceptId: "osc-phase-relationships",
  source: "CED 7.3",
  stem: "An oscillator is momentarily at rest at a turning point. Is the net force on it zero?",
  options: [
    "No — it is at its largest of the whole cycle",
    "Yes, which is why the object is momentarily at rest.",
    "Yes, but only for an instant.",
    "It cannot be determined without knowing the spring constant."
  ],
  answer: 0,
  why: "‘Not moving’ and ‘no force’ are different statements — which is precisely why the object does not stay there. The same confusion appears at the top of a vertical throw.",
  whyNot: [
    "Zero force would mean the object remained at the turning point forever.",
    "Even for an instant it is not zero; the force is at its maximum.",
    "The conclusion follows from $a \\propto x$ whatever the value of $k$."
  ]
},
{
  id: "qz-osc-phase-relationships-03",
  conceptId: "osc-phase-relationships",
  source: "CED 7.3",
  stem: "At $x = A/2$, what fraction of the maximum acceleration and what fraction of the maximum speed does the oscillator have?",
  options: [
    "Half of each.",
    "Half the acceleration, and about 87% of the maximum speed.",
    "A quarter of the acceleration, and half the speed.",
    "Half the acceleration, and half the maximum kinetic energy."
  ],
  answer: 1,
  why: "Acceleration is proportional to $x$, so it halves. Speed depends on $\\sqrt{A^2 - x^2}$, which at $x = A/2$ gives $\\sqrt{3}/2 \\approx 0.87$. Speed falls off slowly at first and then collapses near the turning points.",
  whyNot: [
    "The speed does not scale linearly with displacement, which is why this case feels wrong at first.",
    "The acceleration is linear in $x$, not quadratic.",
    "The kinetic energy at $x = A/2$ is three quarters of its maximum, not half."
  ]
},
{
  id: "qz-osc-phase-relationships-04",
  conceptId: "osc-phase-relationships",
  source: "CED 7.3",
  stem: "Why is the acceleration-time graph an upside-down copy of the position-time graph?",
  options: [
    "Because acceleration is the slope of the velocity graph, and velocity is the slope of position.",
    "Because the two graphs are plotted on different scales.",
    "Because $a_x = -(k/m)x$ at every instant, so acceleration is a fixed negative multiple of displacement.",
    "Because the acceleration lags the displacement by a quarter cycle."
  ],
  answer: 2,
  why: "Same zeros, same extreme times, opposite sign — nothing more to know. It is the defining equation of SHM restated as a picture.",
  whyNot: [
    "True of any motion, and it does not by itself produce an exact mirror image.",
    "Scaling changes the height, not the shape or the sign.",
    "It is the *velocity* that is a quarter cycle out of step; acceleration is exactly antiphase."
  ]
},

{
  id: "qz-osc-energy-01",
  conceptId: "osc-energy",
  source: "CED 7.4",
  stem: "The amplitude of a spring oscillator is tripled. By what factor does its total energy change, and what happens to its period?",
  options: [
    "Energy $\\times 3$; period $\\times 3$.",
    "Energy $\\times 9$; period unchanged.",
    "Energy $\\times 9$; period $\\times 3$.",
    "Energy $\\times 3$; period unchanged."
  ],
  answer: 1,
  why: "$E = \\frac{1}{2}kA^2$, so energy goes as $A^2$. The period contains no amplitude at all, so it does not move — and the maximum speed, $A\\sqrt{k/m}$, triples.",
  whyNot: [
    "Energy is quadratic in amplitude, not linear, and the period is unaffected either way.",
    "The period never depends on amplitude for an ideal oscillator.",
    "The energy factor is 9, not 3."
  ]
},
{
  id: "qz-osc-energy-02",
  conceptId: "osc-energy",
  source: "CED 7.4",
  stem: "A 0.30 kg block on a spring with $k = 12$ N/m is pulled 0.20 m from equilibrium and released. What is the total mechanical energy?",
  options: [
    "0.24 J",
    "0.48 J",
    "1.2 J",
    "2.4 J"
  ],
  answer: 0,
  why: "$E = \\frac{1}{2}kA^2 = \\frac{1}{2}(12)(0.040) = 0.24$ J. That figure is not on the sheet, but $U_s = \\frac{1}{2}k(\\Delta x)^2$ is, and evaluating it at $\\Delta x = A$ where $v = 0$ regenerates it in one line.",
  whyNot: [
    "0.48 J drops the factor of $\\frac{1}{2}$.",
    "1.2 J uses $A$ rather than $A^2$.",
    "2.4 J compounds both errors."
  ]
},
{
  id: "qz-osc-energy-03",
  conceptId: "osc-energy",
  source: "CED 7.4",
  stem: "To find an oscillator's speed at a given displacement, why use energy conservation rather than $v^2 = v_0^2 + 2a\\Delta x$?",
  options: [
    "Because the kinematics equation is not on the equation sheet.",
    "Because energy conservation also gives the period.",
    "Because that kinematics equation assumes constant acceleration",
    "Because the acceleration in SHM is always zero on average."
  ],
  answer: 2,
  why: "No choice of a single value for $a$ rescues it. Energy conservation makes no such assumption and links speed to position directly: $\\frac{1}{2}kA^2 = \\frac{1}{2}kx^2 + \\frac{1}{2}mv^2$.",
  whyNot: [
    "It is on the sheet — and being printed does not make it applicable.",
    "Energy gives speeds, not timings; the period comes from $2\\pi\\sqrt{m/k}$.",
    "Its average being zero is true and irrelevant; the equation needs it *constant*."
  ]
},
{
  id: "qz-osc-energy-04",
  conceptId: "osc-energy",
  source: "CED 7.4",
  stem: "How often does the kinetic energy of an oscillator reach its maximum during one full cycle?",
  options: [
    "Twice, because the object passes through equilibrium twice per cycle.",
    "Once, at the same moment the displacement peaks.",
    "Four times, once per quarter cycle.",
    "Continuously, since the total energy is constant."
  ],
  answer: 0,
  why: "The energy exchange runs at twice the frequency of the motion: displacement peaks positively once per cycle, while the object crosses equilibrium — where all the energy is kinetic — on the way out and on the way back.",
  whyNot: [
    "Displacement peaks are where the kinetic energy is zero, not maximum.",
    "The quarter-cycle points include the two turning points, where $K = 0$.",
    "The *total* is constant; the kinetic share rises and falls."
  ]
},

/* ---- Unit 8 · Fluids ------------------------------------------------------ */

{
  id: "qz-flu-fluid-structure-01",
  conceptId: "flu-fluid-structure",
  source: "CED 8.1",
  stem: "What counts as a fluid in this course?",
  options: [
    "Liquids only.",
    "Liquids and gases — any substance with no fixed shape.",
    "Any substance that flows under gravity, which excludes gases.",
    "Liquids and any solid fine enough to pour."
  ],
  answer: 1,
  why: "Gases are fluids, so questions about air are fair game. Reading ‘fluid’ as ‘liquid’ quietly rules out half the topic.",
  whyNot: [
    "This is the everyday sense of the word and the standard error here.",
    "Gases flow perfectly well and are covered by the same equations.",
    "Powders are not treated as fluids in this course; the criterion is the strength of the interactions between the constituent particles."
  ]
},
{
  id: "qz-flu-fluid-structure-02",
  conceptId: "flu-fluid-structure",
  source: "CED 8.1",
  stem: "An **ideal** fluid has which two properties, and what does each one buy you?",
  options: [
    "Constant temperature and no turbulence, which make the flow steady.",
    "Zero density and zero pressure, which simplify the equations.",
    "Incompressibility, which makes continuity work; and no viscosity",
    "Fixed volume and fixed shape, which make it behave like a solid."
  ],
  answer: 2,
  why: "Both are modelling choices, not facts about water. The exam's conventions grant them unless a question says otherwise — and a question that mentions turbulence or honey is telling you they have been withdrawn.",
  whyNot: [
    "Steady flow is a separate condition, and temperature does not appear in this unit at all.",
    "A fluid with no density would have no weight and no pressure gradient.",
    "A fixed shape is exactly what a fluid does not have."
  ]
},
{
  id: "qz-flu-fluid-structure-03",
  conceptId: "flu-fluid-structure",
  source: "CED 8.1",
  stem: "You push hard on a sealed syringe of water, raising the pressure inside by one atmosphere. Treating the water as ideal, what happens to its volume and density?",
  options: [
    "Volume falls slightly; density rises slightly.",
    "Volume falls by about 1%; density is unchanged.",
    "Volume rises; density falls.",
    "Both are unchanged — incompressible means exactly that."
  ],
  answer: 3,
  why: "Incompressibility is the assumption that volume, and therefore density, does not change however hard you squeeze. It is what lets continuity say that whatever enters a pipe per second must leave per second.",
  whyNot: [
    "That is what a real fluid does, by a very small amount; the model says otherwise.",
    "Volume and density cannot move independently for a fixed mass.",
    "Squeezing does not expand a fluid."
  ]
},
{
  id: "qz-flu-fluid-structure-04",
  conceptId: "flu-fluid-structure",
  source: "CED 8.1",
  stem: "Why is Unit 8 described as mostly not new physics?",
  options: [
    "Because fluids obey a separate set of rules that happen to resemble mechanics.",
    "Because buoyancy is Newton's laws applied to a fluid and Bernoulli's equation is conservation of energy.",
    "Because fluid problems are always qualitative.",
    "Because the equation sheet contains no fluid equations."
  ],
  answer: 1,
  why: "Seeing it that way keeps the checks you already know available — free-body diagrams for buoyancy, energy accounting for Bernoulli — and stops the unit inflating into a list of formulas to memorise.",
  whyNot: [
    "Treating them as a separate body of rules is exactly the reading that makes the unit look bigger than it is.",
    "Fluid questions are quantitative throughout.",
    "The sheet carries $\\rho = m/V$, $P = F_\\perp/A$, $P = P_0 + \\rho g h$, $F_b = \\rho V g$, $A_1v_1 = A_2v_2$ and Bernoulli's equation."
  ]
},

{
  id: "qz-flu-density-01",
  conceptId: "flu-density",
  source: "CED 8.1",
  stem: "A block measures 0.20 m by 0.10 m by 0.050 m and has a mass of 0.72 kg. What is its density, and will it float in water of density 1000 kg/m$^3$?",
  options: [
    "0.72 kg/m$^3$; it floats.",
    "7200 kg/m$^3$; it sinks.",
    "720 kg/m$^3$; it floats.",
    "1440 kg/m$^3$; it sinks."
  ],
  answer: 2,
  why: "$V = 1.0 \\times 10^{-3}$ m$^3$, so $\\rho = 0.72 / 0.001 = 720$ kg/m$^3$. That is below the water's density, so it floats — with 72% of its volume submerged.",
  whyNot: [
    "0.72 kg/m$^3$ is the mass with no division at all, and would be thinner than air.",
    "7200 is out by a factor of ten and would sink like steel.",
    "1440 doubles the correct value."
  ]
},
{
  id: "qz-flu-density-02",
  conceptId: "flu-density",
  source: "CED 8.1",
  stem: "Does the equation sheet give you the density of water?",
  options: [
    "Yes, in the constants block alongside $g$.",
    "Yes, but only as 1 g/cm$^3$.",
    "No — its constants are $g$, the gravitational constant and one atmosphere, so any density a question needs must be supplied in the question.",
    "No, but 1000 kg/m$^3$ may be assumed without being told."
  ],
  answer: 2,
  why: "If you find yourself trying to recall a density, re-read the stem — it is there. This is worth knowing because it tells you what a fluids question must contain.",
  whyNot: [
    "The constants block does not include any substance's density.",
    "Neither unit of it appears on the sheet.",
    "Assuming a value the question did not give is how a wrong fluid ends up in a right method."
  ]
},
{
  id: "qz-flu-density-03",
  conceptId: "flu-density",
  source: "CED 8.1",
  stem: "How do you find the overall density of a hollow object such as a steel boat?",
  options: [
    "By taking the density of the material it is made from.",
    "By averaging the densities of the steel and the enclosed air.",
    "By dividing the mass of the steel by the volume of the steel.",
    "Total mass divided by total volume"
  ],
  answer: 3,
  why: "The air adds a great deal of volume and almost no mass, which is exactly why a steel hull can have an overall density well below the water's. Flood it and the mass rises while the volume does not.",
  whyNot: [
    "That gives the steel's density, which is what makes the result look impossible.",
    "A plain average ignores how much of each is present.",
    "This is the material density again, in another dress."
  ]
},
{
  id: "qz-flu-density-04",
  conceptId: "flu-density",
  source: "CED 8.1",
  stem: "Why compare **densities** rather than masses when asking whether something floats?",
  options: [
    "Because mass is harder to measure than density.",
    "Because density does not depend on how much of the substance you have, while mass does.",
    "Because buoyancy does not depend on mass at all.",
    "Because the buoyant force is proportional to density."
  ],
  answer: 1,
  why: "A large light object can be far more massive than a small dense one and still float. Floating is settled by $\\rho_{object}$ against $\\rho_{fluid}$, which is a size-independent comparison.",
  whyNot: [
    "Mass is the easier of the two to measure; that is not the reason.",
    "Buoyancy is compared *with* the object's weight, which certainly depends on its mass.",
    "$F_b = \\rho Vg$ uses the *fluid's* density, and that is a fact about the force, not about why the comparison works."
  ]
},

{
  id: "qz-flu-pressure-01",
  conceptId: "flu-pressure",
  source: "CED 8.2",
  stem: "Is pressure a vector?",
  options: [
    "Yes, pointing perpendicular to the surface.",
    "Yes, pointing in the direction the fluid flows.",
    "No — it is a scalar; the *force* it produces is the vector",
    "No, but it becomes one once multiplied by an area."
  ],
  answer: 2,
  why: "Turning a surface changes the direction of the resulting force but not the pressure at that point. Microscopically the pressure is already an average over collisions arriving from all directions, which is why no direction survives.",
  whyNot: [
    "That is the direction of the force, obtained from $F = PA$.",
    "Pressure exists in a fluid at rest, where nothing flows at all.",
    "The second half is right — $F = PA$ is a vector — but the first half concedes the wrong thing: pressure is never a vector."
  ]
},
{
  id: "qz-flu-pressure-02",
  conceptId: "flu-pressure",
  source: "CED 8.2",
  stem: "A 60 kg person stands on one foot, with a sole area of $1.4 \\times 10^{-2}$ m$^2$. What pressure do they exert on the floor? Use $g = 9.8$ m/s$^2$.",
  options: [
    "$8.2 \\times 10^{3}$ Pa",
    "$4.2 \\times 10^{4}$ Pa",
    "$4.3 \\times 10^{3}$ Pa",
    "$1.0 \\times 10^{5}$ Pa"
  ],
  answer: 1,
  why: "$P = F/A = 588 / 0.014 = 4.2 \\times 10^4$ Pa — about 0.4 atmospheres, which is a useful reminder of how large an atmosphere actually is.",
  whyNot: [
    "$8.2 \\times 10^3$ Pa would need a sole about seven times larger.",
    "$4.3 \\times 10^3$ divides the mass rather than the weight by the area.",
    "$1.0 \\times 10^5$ Pa is one atmosphere, which the person does not reach standing on one foot."
  ]
},
{
  id: "qz-flu-pressure-03",
  conceptId: "flu-pressure",
  source: "CED 8.2",
  stem: "What makes a fluid start to move?",
  options: [
    "A pressure difference: an element with more pressure on one side than the other has a net force and accelerates.",
    "Gravity, which is the only force available in a fluid.",
    "A high absolute pressure, since high-pressure fluid moves fastest.",
    "Viscosity, which drags neighbouring layers along."
  ],
  answer: 0,
  why: "This is the sentence connecting Unit 8 to Unit 2, and it is why continuity and Bernoulli have anything to discuss: without a pressure difference, nothing flows.",
  whyNot: [
    "Gravity drives some flows and is not needed for a horizontal pipe.",
    "A uniform high pressure produces no net force at all — the pushes on opposite faces cancel.",
    "An ideal fluid has no viscosity and still flows."
  ]
},
{
  id: "qz-flu-pressure-04",
  conceptId: "flu-pressure",
  source: "CED 8.2",
  stem: "Which use of $P = F_\\perp/A$ do exam questions lean on most?",
  options: [
    "Finding the area from a force and a pressure.",
    "Finding the pressure from a measured force.",
    "Finding a density from a pressure.",
    "Finding the force on a surface from a pressure and an area, $F = PA$."
  ],
  answer: 3,
  why: "Every buoyancy derivation, every hydraulic-lift problem and every ‘what force does the water exert on this window’ question runs through $F = PA$.",
  whyNot: [
    "Solving for area is occasionally useful and rarely the point of a question.",
    "This is the definition's forward direction, which is the less-used one here.",
    "Density comes in through $P = P_0 + \\rho gh$, not through this relation."
  ]
},

{
  id: "qz-flu-hydrostatic-01",
  conceptId: "flu-hydrostatic",
  source: "CED 8.2",
  stem: "A diver is 12 m below the surface of a fresh-water lake open to the air ($\\rho = 1000$ kg/m$^3$). What are the gauge and absolute pressures there?",
  options: [
    "Gauge $1.18 \\times 10^5$ Pa; absolute $2.18 \\times 10^5$ Pa.",
    "Gauge $2.18 \\times 10^5$ Pa; absolute $1.18 \\times 10^5$ Pa.",
    "Gauge $1.18 \\times 10^5$ Pa; absolute $1.18 \\times 10^5$ Pa.",
    "Gauge $1.2 \\times 10^4$ Pa; absolute $1.12 \\times 10^5$ Pa."
  ],
  answer: 0,
  why: "$\\rho gh = 1000 \\times 9.8 \\times 12 = 1.18 \\times 10^5$ Pa is the gauge pressure; add one atmosphere for the absolute. Note that about 10 m of water is worth roughly one atmosphere.",
  whyNot: [
    "Absolute is the larger of the two — it includes the atmosphere on top.",
    "They are equal only if the surface is in a vacuum.",
    "$1.2 \\times 10^4$ Pa omits the factor of $g$."
  ]
},
{
  id: "qz-flu-hydrostatic-02",
  conceptId: "flu-hydrostatic",
  source: "CED 8.2",
  stem: "In the derivation of $\\rho gh$, why does the container's width never appear?",
  options: [
    "Because the fluid is incompressible.",
    "Because the imaginary column's area $A$ multiplies every term and cancels when you divide through.",
    "Because pressure is a scalar.",
    "Because the walls exert no force on the fluid."
  ],
  answer: 1,
  why: "Weight $\\rho Ahg$, upward push $PA$, downward push $P_0A$ — every term carries the same $A$. Divide by it and the width is gone, which is why a straw and a lake are at the same pressure at the same depth.",
  whyNot: [
    "Incompressibility keeps $\\rho$ constant but says nothing about the area.",
    "Being a scalar is a consequence rather than the reason this term is width-independent.",
    "The walls do exert forces, and on a sloping vessel those forces matter — see the hydrostatic paradox."
  ]
},
{
  id: "qz-flu-hydrostatic-03",
  conceptId: "flu-hydrostatic",
  source: "CED 8.2",
  stem: "Two points sit at the same depth in the same connected body of static fluid, ten metres apart horizontally. Compare their pressures.",
  options: [
    "The one under the wider part of the vessel is at higher pressure.",
    "The one nearer the wall is at higher pressure.",
    "They are equal — the hydrostatic relation contains only the depth.",
    "They cannot be compared without knowing the shape of the container."
  ],
  answer: 2,
  why: "Horizontal separation does not appear in $P = P_0 + \\rho gh$. That fact is what makes a hydraulic lift work: the two pistons sit at the same depth and therefore feel the same pressure.",
  whyNot: [
    "Width affects the *force* on a base, through $F = PA$, never the pressure.",
    "Proximity to a wall has no bearing on the pressure at a given depth.",
    "The shape is exactly what the relation is indifferent to."
  ]
},
{
  id: "qz-flu-hydrostatic-04",
  conceptId: "flu-hydrostatic",
  source: "CED 8.2",
  stem: "How is the hydrostatic relation related to Bernoulli's equation?",
  options: [
    "They are rival formulas; use whichever matches the situation.",
    "The hydrostatic relation is Bernoulli's equation with both speeds set to zero.",
    "Bernoulli's equation applies only to gases, the hydrostatic relation only to liquids.",
    "The hydrostatic relation is the more general one."
  ],
  answer: 1,
  why: "Set $v_1 = v_2 = 0$ and the kinetic terms vanish, leaving $P_1 = P_2 + \\rho g(y_2 - y_1)$ — the same statement with $h$ measured downward. They cannot contradict each other, because one contains the other.",
  whyNot: [
    "Rival formulas would be able to disagree, and these never can.",
    "Both apply to any fluid, liquid or gas.",
    "Bernoulli is the more general one; the static case is its special case."
  ]
},

{
  id: "qz-flu-gauge-absolute-01",
  conceptId: "flu-gauge-absolute",
  source: "CED 8.2",
  stem: "A tyre goes completely flat. What does a tyre gauge read, and what is the absolute pressure inside?",
  options: [
    "Gauge zero; absolute zero — the tyre is empty.",
    "Gauge one atmosphere; absolute zero.",
    "Gauge zero; absolute about $1.0 \\times 10^5$ Pa",
    "Both read one atmosphere."
  ],
  answer: 2,
  why: "A gauge measures the excess over atmospheric, so it reads zero when the inside and the outside match. The tyre still contains air at one atmosphere — an actual vacuum would collapse it.",
  whyNot: [
    "An absolute pressure of zero is a vacuum, which a flat tyre is not.",
    "The gauge reads the difference, which is zero here.",
    "The gauge reads zero, not one atmosphere; that is the whole point of the reference."
  ]
},
{
  id: "qz-flu-gauge-absolute-02",
  conceptId: "flu-gauge-absolute",
  source: "CED 8.2",
  stem: "A tyre gauge reads $2.2 \\times 10^5$ Pa. What is the net outward force from the two air pressures on a $1.0 \\times 10^{-2}$ m$^2$ patch of the wall?",
  options: [
    "2200 N",
    "3200 N",
    "1200 N",
    "5400 N"
  ],
  answer: 0,
  why: "The atmosphere pushes inward on the far side, so the net force comes from the *difference* — the gauge pressure. $F = P_{gauge}A = 2.2 \\times 10^5 \\times 10^{-2} = 2200$ N.",
  whyNot: [
    "3200 N uses the absolute pressure and forgets the atmosphere pressing back on the outside.",
    "1200 N subtracts an atmosphere from the gauge reading, which has already excluded it.",
    "5400 N adds the two pressures instead of taking their difference."
  ]
},
{
  id: "qz-flu-gauge-absolute-03",
  conceptId: "flu-gauge-absolute",
  source: "CED 8.2",
  stem: "Why do engineers quote gauge pressure rather than absolute?",
  options: [
    "Because absolute pressure is difficult to measure.",
    "Because gauge pressure is always the larger number.",
    "Because a uniform pressure produces no net force",
    "Because the atmosphere varies with the weather, making absolute pressure unreliable."
  ],
  answer: 2,
  why: "Net forces come from pressure *differences*. With the atmosphere on both sides of a wall, tyre casing or eardrum, the atmospheric contribution cancels and only the excess does structural work.",
  whyNot: [
    "Absolute pressure is measured routinely; convenience is not the reason.",
    "Gauge pressure is the smaller number, being absolute minus the reference.",
    "Atmospheric variation is real and tiny compared with the pressures being quoted."
  ]
},
{
  id: "qz-flu-gauge-absolute-04",
  conceptId: "flu-gauge-absolute",
  source: "CED 8.2",
  stem: "Should gauge or absolute pressure go into Bernoulli's equation?",
  options: [
    "Gauge, since Bernoulli deals in differences.",
    "Either, since the reference always cancels.",
    "Gauge for liquids and absolute for gases.",
    "Absolute — its $P$ term is an energy per unit volume"
  ],
  answer: 3,
  why: "Using gauge on both sides happens to work when both points are exposed to the same reference, because the $P_0$ then cancels. That is a property of the setup, not a rule, and it fails as soon as one point is inside a sealed vessel.",
  whyNot: [
    "Bernoulli balances energy densities, not only differences — and the terms are not all pressures.",
    "The cancellation is a coincidence of the common case, and relying on it is what fails on sealed-vessel problems.",
    "The state of the fluid makes no difference to which pressure the equation wants."
  ]
},

{
  id: "qz-flu-hydrostatic-paradox-01",
  conceptId: "flu-hydrostatic-paradox",
  source: "CED 8.2",
  stem: "A swimming pool and a drinking straw are filled with water to the same depth. Compare the pressure and the force at the bottom of each.",
  options: [
    "Pressure and force are both greater in the pool.",
    "Pressures are equal; the force on the pool's bottom is far greater.",
    "Pressure is greater in the straw, because the column is narrow.",
    "Both are equal, since the depths match."
  ],
  answer: 1,
  why: "Pressure at a depth depends only on $\\rho$, $g$, $h$ and the reference pressure. Force is $PA$, and the pool's bottom has an enormously larger area.",
  whyNot: [
    "Pressure does not care about width, which is exactly what the derivation showed.",
    "Narrowness raises neither the pressure nor the force.",
    "The forces are wildly different, even though the pressures match."
  ]
},
{
  id: "qz-flu-hydrostatic-paradox-02",
  conceptId: "flu-hydrostatic-paradox",
  source: "CED 8.2",
  stem: "A vessel with a wide flat base and a narrow neck holds water whose weight is 510 N, yet the downward force on its base is 1568 N. Where does the extra force come from?",
  options: [
    "From atmospheric pressure acting on the neck.",
    "From the extra pressure produced by the narrow neck.",
    "From the sloping walls, which push down on the water with the difference.",
    "Nowhere — the calculation must be wrong, since force cannot exceed weight."
  ],
  answer: 2,
  why: "Draw a free-body diagram of the water: gravity down, base pushing up, walls pushing perpendicular to their own sloping surfaces, which has a downward component. The water is in equilibrium, so the walls make up exactly the 1058 N difference.",
  whyNot: [
    "The atmosphere presses on the base from below too and largely cancels.",
    "The neck does not change the pressure at a given depth — that is the paradox.",
    "The calculation is right; the assumption that base force equals fluid weight is what is wrong."
  ]
},
{
  id: "qz-flu-hydrostatic-paradox-03",
  conceptId: "flu-hydrostatic-paradox",
  source: "CED 8.2",
  stem: "When does the downward force on a vessel's base equal the weight of the fluid in it?",
  options: [
    "Always — the fluid's weight has to be supported by the base.",
    "Only when the walls are straight and vertical.",
    "Only when the vessel is open to the atmosphere.",
    "Only when the fluid is water."
  ],
  answer: 1,
  why: "With straight walls the wall forces are horizontal and contribute nothing vertically. Flare the vessel outward and the walls push down on the water; narrow it and they push up. That is the rule, and vertical walls are the special case.",
  whyNot: [
    "The walls can carry part of the load, up or down, so the base does not always see the whole weight.",
    "Being open changes the reference pressure, which cancels from both sides.",
    "The fluid's identity affects $\\rho$ and nothing about the geometry."
  ]
},
{
  id: "qz-flu-hydrostatic-paradox-04",
  conceptId: "flu-hydrostatic-paradox",
  source: "CED 8.2",
  stem: "On what does the pressure at a given depth in a static fluid depend?",
  options: [
    "The fluid's density, $g$, the depth, and the reference pressure at the top.",
    "Those four, plus the total volume of fluid present.",
    "Those four, plus the area of the base.",
    "The mass of fluid above the point and the area it sits on."
  ],
  answer: 0,
  why: "Container shape, width, total volume and total mass are all absent. That is what makes a vessel with a narrow neck able to produce a base force many times the weight of the water it holds.",
  whyNot: [
    "Volume never appears in $P = P_0 + \\rho gh$.",
    "The base area enters the *force*, through $F = PA$, not the pressure.",
    "This is right only for a straight-walled vessel, and it is the reasoning the paradox exists to break."
  ]
},

{
  id: "qz-flu-pascal-hydraulic-01",
  conceptId: "flu-pascal-hydraulic",
  source: "CED 8.2",
  stem: "A hydraulic lift has pistons of area $2.0 \\times 10^{-3}$ m$^2$ and $8.0 \\times 10^{-2}$ m$^2$ at the same height. You push the small piston with 50 N and it descends 0.60 m. What happens at the large piston?",
  options: [
    "2000 N through 0.60 m, so 1200 J out for 30 J in.",
    "2000 N through 0.015 m, so 30 J out for 30 J in.",
    "50 N through 24 m, so 1200 J out for 30 J in.",
    "1250 N through 0.024 m, so 30 J out for 30 J in."
  ],
  answer: 1,
  why: "The area ratio is 40, so the force is multiplied by 40 and the distance divided by 40. The ratio appears once multiplying and once dividing, so the work is unchanged — as conservation of energy requires.",
  whyNot: [
    "A machine that returned 1200 J for 30 J would be a perpetual motion machine built from a jack and a bucket.",
    "The large piston exerts more force, not the same force over a longer distance.",
    "1250 N corresponds to an area ratio of 25 rather than 40."
  ]
},
{
  id: "qz-flu-pascal-hydraulic-02",
  conceptId: "flu-pascal-hydraulic",
  source: "CED 8.2",
  stem: "A piston's radius is made 4 times larger. By what factor does the force it can exert increase, at the same pressure?",
  options: [
    "4",
    "8",
    "16",
    "2"
  ],
  answer: 2,
  why: "$F = PA$ and $A = \\pi r^2$, so the force follows the *area*, which grows as the square of the radius. Using the radius ratio where the area ratio belongs is the standard slip in this topic.",
  whyNot: [
    "4 is the radius ratio, not the area ratio.",
    "8 would be a cube dependence, which no area has.",
    "2 is the square root of the radius ratio and corresponds to nothing here."
  ]
},
{
  id: "qz-flu-pascal-hydraulic-03",
  conceptId: "flu-pascal-hydraulic",
  source: "CED 8.2",
  stem: "Which hydraulic-lift relations are printed on the equation sheet?",
  options: [
    "$F_1/A_1 = F_2/A_2$ only.",
    "$A_1d_1 = A_2d_2$ only.",
    "Both of them.",
    "Neither — you reconstruct both from $P = F_\\perp/A$ plus equal pressure at equal depth."
  ],
  answer: 3,
  why: "Worth practising the derivation, because on the day you will not be handed either line. The force relation is equal pressures plus $F = PA$; the distance relation is incompressibility.",
  whyNot: [
    "The force relation is not printed.",
    "Nor is the distance relation.",
    "Neither appears on the sheet."
  ]
},
{
  id: "qz-flu-pascal-hydraulic-04",
  conceptId: "flu-pascal-hydraulic",
  source: "CED 8.2",
  stem: "Does a hydraulic lift create energy?",
  options: [
    "Yes — that is what force multiplication means.",
    "Yes, but only while the fluid is moving.",
    "No — work out equals work in for an ideal fluid",
    "No, but it can store energy in the compressed fluid."
  ],
  answer: 2,
  why: "The area ratio cancels between force and distance. A real jack returns less than you put in, because real fluids have viscosity and real seals have friction.",
  whyNot: [
    "Force multiplication is bought entirely with distance, not with new energy.",
    "Motion does not create energy at any stage.",
    "An ideal fluid is incompressible, so there is no compression in which to store anything."
  ]
},

{
  id: "qz-flu-buoyancy-01",
  conceptId: "flu-buoyancy",
  source: "CED 8.3",
  stem: "In $F_b = \\rho Vg$, whose density is $\\rho$ and which volume is $V$?",
  options: [
    "The object's density and the object's whole volume.",
    "The fluid's density and the volume of fluid displaced",
    "The object's density and the submerged volume.",
    "The average of the two densities, and the total volume."
  ],
  answer: 1,
  why: "The sheet prints the equation without saying whose density it means, and that is where most marks in this topic are lost. The object's material never entered the derivation at any point.",
  whyNot: [
    "Putting the object's density in is the single commonest error here.",
    "Half right: the volume is the submerged one, but the density is the fluid's.",
    "No average appears anywhere in the derivation."
  ]
},
{
  id: "qz-flu-buoyancy-02",
  conceptId: "flu-buoyancy",
  source: "CED 8.3",
  stem: "A fully submerged rock is lowered from 1 m deep to 5 m deep in water. What happens to the buoyant force on it?",
  options: [
    "It increases, because the pressure is greater down there.",
    "It decreases, because the water above weighs it down.",
    "Nothing — the force depends on the pressure *difference* across the object, which is the same at any depth.",
    "It increases in proportion to the depth."
  ],
  answer: 2,
  why: "In the derivation the depths appear only as $h_2 - h_1$, which is the object's own height. Both pressures rise together as it descends, and their difference does not move.",
  whyNot: [
    "The pressure on the bottom rises — and so does the pressure on the top, by the same amount.",
    "The weight of the water above is already accounted for in the pressure on the top face.",
    "There is no depth dependence at all in an incompressible fluid."
  ]
},
{
  id: "qz-flu-buoyancy-03",
  conceptId: "flu-buoyancy",
  source: "CED 8.3",
  stem: "A cube of side 0.10 m is fully submerged in water ($\\rho = 1000$ kg/m$^3$). What is the buoyant force on it? Use $g = 9.8$ m/s$^2$.",
  options: [
    "0.98 N",
    "98 N",
    "9800 N",
    "9.8 N"
  ],
  answer: 3,
  why: "$V = 1.0 \\times 10^{-3}$ m$^3$, so $F_b = 1000 \\times 10^{-3} \\times 9.8 = 9.8$ N — and computing it from the pressures on the top and bottom faces gives the same number, which is what the derivation shows.",
  whyNot: [
    "0.98 N is out by a factor of ten.",
    "98 N would need ten litres of displaced water.",
    "9800 N is the weight of a cubic metre of water."
  ]
},
{
  id: "qz-flu-buoyancy-04",
  conceptId: "flu-buoyancy",
  source: "CED 8.3",
  stem: "Why does atmospheric pressure $P_0$ not appear in the buoyant force?",
  options: [
    "Because it is negligible compared with $\\rho gh$.",
    "Because it appears identically in the pressure on the top and bottom faces, and $F_b$ is their difference.",
    "Because the atmosphere does not act on submerged objects.",
    "Because buoyancy is defined using gauge pressure."
  ],
  answer: 1,
  why: "The cancellation is one of three things that fall out of the derivation at once — along with the depth-independence and the irrelevance of the object's material.",
  whyNot: [
    "One atmosphere is comparable to 10 m of water, so it is anything but negligible.",
    "It acts through the water on everything in it.",
    "The derivation uses absolute pressures throughout, and the reference cancels on its own."
  ]
},

{
  id: "qz-flu-floating-01",
  conceptId: "flu-floating",
  source: "CED 8.3",
  stem: "A block of density 650 kg/m$^3$ floats in fresh water of density 1000 kg/m$^3$. What fraction of its volume is below the surface?",
  options: [
    "0.65",
    "1.54",
    "0.35",
    "It depends on the block's size."
  ],
  answer: 0,
  why: "Equilibrium gives $\\rho_fV_{sub}g = \\rho_oV_{obj}g$, so $V_{sub}/V_{obj} = \\rho_o/\\rho_f = 0.65$. Deriving it each time is what protects you from inverting it.",
  whyNot: [
    "1.54 is the ratio upside down, and a submerged fraction above one should be an instant alarm.",
    "0.35 is the fraction *above* the surface.",
    "The submerged fraction is a pure ratio of densities and is entirely size-independent."
  ]
},
{
  id: "qz-flu-floating-02",
  conceptId: "flu-floating",
  source: "CED 8.3",
  stem: "Why does a ship float higher in seawater than in fresh water?",
  options: [
    "Because seawater exerts less pressure on the hull.",
    "Because salt reduces the ship's effective weight.",
    "Because the submerged fraction is $\\rho_{object}/\\rho_{fluid}$, and raising the denominator lowers the fraction.",
    "Because seawater is more viscous."
  ],
  answer: 2,
  why: "A block that sits 65% submerged in fresh water sits 63.4% submerged in seawater of density 1025 kg/m$^3$ — a small change, and a real one that ships are loaded around.",
  whyNot: [
    "Denser fluid means more pressure at a given depth, not less.",
    "The ship's weight is unchanged; what changes is how much volume must be displaced to match it.",
    "Viscosity plays no part in a floating equilibrium."
  ]
},
{
  id: "qz-flu-floating-03",
  conceptId: "flu-floating",
  source: "CED 8.3",
  stem: "A submerged submarine floods its ballast tanks and sinks. What is the correct explanation?",
  options: [
    "The buoyant force decreased, because the tanks are now full.",
    "Its total mass rose while its total volume did not",
    "The added water increased the pressure on the hull.",
    "Its displaced volume decreased."
  ],
  answer: 1,
  why: "The displaced volume is unchanged, so $F_b = \\rho Vg$ is unchanged too. It is the weight that went up — which is exactly the distinction the ‘buoyancy decreased’ answer misses.",
  whyNot: [
    "This is the standard wrong explanation: the buoyant force depends on the fluid's density and the displaced volume, neither of which changed.",
    "Hull pressure is set by depth, not by what is inside.",
    "The hull occupies the same space whether the tanks hold air or water."
  ]
},
{
  id: "qz-flu-floating-04",
  conceptId: "flu-floating",
  source: "CED 8.3",
  stem: "What does a scale read for an object hanging from it while fully submerged?",
  options: [
    "$mg$, since the object's weight is unchanged.",
    "$F_b$, the buoyant force.",
    "Zero, if the object is denser than the fluid.",
    "$mg - F_b$ — the part of the weight that buoyancy does not support."
  ],
  answer: 3,
  why: "This is just $\\sum F = 0$ on an ordinary free-body diagram with one extra upward force. The whole unit is Newton's laws with buoyancy added to the diagram.",
  whyNot: [
    "The weight is unchanged, but the scale supplies only what buoyancy leaves.",
    "The scale would read $F_b$ only if the object were weightless.",
    "A denser object still needs support, so the reading is positive."
  ]
},

{
  id: "qz-flu-continuity-01",
  conceptId: "flu-continuity",
  source: "CED 8.4",
  stem: "Water flows at 1.5 m/s through a pipe of radius 0.040 m, which then narrows to radius 0.020 m. What is the speed in the narrow section?",
  options: [
    "3.0 m/s",
    "0.375 m/s",
    "6.0 m/s",
    "0.75 m/s"
  ],
  answer: 2,
  why: "Continuity uses the *area* ratio: halving the radius quarters the area, so the speed is multiplied by four. $1.5 \\times 4 = 6.0$ m/s.",
  whyNot: [
    "3.0 m/s uses the radius ratio rather than the area ratio — the standard error here.",
    "0.375 m/s divides where it should multiply.",
    "0.75 m/s halves the speed, which would be right only if narrowing slowed the flow."
  ]
},
{
  id: "qz-flu-continuity-02",
  conceptId: "flu-continuity",
  source: "CED 8.4",
  stem: "Does a narrower pipe make the flow slower, because it restricts it?",
  options: [
    "No — the speed rises, because in a filled pipe nothing can accumulate",
    "Yes — a restriction always reduces the speed.",
    "No — the speed is unchanged, because the flow rate is conserved.",
    "It depends on the fluid's viscosity."
  ],
  answer: 0,
  why: "The ‘restricts it’ picture belongs to a real viscous fluid driven at a fixed pressure, where narrowing does cut total throughput. In the ideal steady problem the volume per second is fixed, so a smaller area demands a larger speed.",
  whyNot: [
    "This is the intuition that continuity contradicts.",
    "The volume flow rate is conserved, and that is precisely why the speed must change.",
    "An ideal fluid has no viscosity, and the result holds regardless."
  ]
},
{
  id: "qz-flu-continuity-03",
  conceptId: "flu-continuity",
  source: "CED 8.4",
  stem: "Which three conditions does $A_1v_1 = A_2v_2$ require?",
  options: [
    "Incompressible fluid, steady flow, pipe completely filled.",
    "Horizontal pipe, constant pressure, no gravity.",
    "Non-viscous fluid, laminar flow, circular cross-section.",
    "Constant temperature, constant density, constant pressure."
  ],
  answer: 0,
  why: "The exam's conventions grant the ideal fluid and the filled pipe by default; steadiness is an assumption you are making, and the conventions do not mention it. Break any of the three — a half-full pipe, a gas being compressed — and the conserved quantity becomes the mass flow rate $\\rho Av$ instead.",
  whyNot: [
    "Continuity works perfectly well on a pipe that climbs a hill.",
    "Viscosity affects Bernoulli, not the mass bookkeeping, and the cross-section can be any shape.",
    "Pressure varies along a pipe of changing area — that is Bernoulli's whole subject."
  ]
},
{
  id: "qz-flu-continuity-04",
  conceptId: "flu-continuity",
  source: "CED 8.4",
  stem: "Which of these is a **derived** equation the CED expects you to produce rather than find on the sheet?",
  options: [
    "$A_1v_1 = A_2v_2$",
    "$P = P_0 + \\rho gh$",
    "$\\rho = m/V$",
    "The volume flow rate $V/t = Av$"
  ],
  answer: 3,
  why: "It is easy to produce: in a time $t$ the fluid at a cross-section moves $vt$, sweeping a cylinder of volume $Avt$, so the volume per unit time is $Av$.",
  whyNot: [
    "Continuity is printed on the sheet.",
    "So is the hydrostatic relation.",
    "So is the definition of density."
  ]
},

{
  id: "qz-flu-bernoulli-01",
  conceptId: "flu-bernoulli",
  source: "CED 8.4",
  stem: "In a horizontal pipe the fluid speeds up. What happens to the pressure, and why?",
  options: [
    "It rises, because fast-moving fluid pushes harder.",
    "It falls: the three terms share a fixed total and the height terms cancel, so a larger kinetic term forces a smaller pressure term.",
    "It is unchanged, since pressure depends only on depth.",
    "It falls, but only if the fluid is viscous."
  ],
  answer: 1,
  why: "‘Fast fluid pushes harder’ confuses kinetic energy density with pressure. The fluid does have more kinetic energy per unit volume — and the pressure term is what paid for it.",
  whyNot: [
    "This is the intuition that predicts the wrong sign for every constriction problem.",
    "Depth fixes the pressure only in a *static* fluid.",
    "Viscosity would remove energy from the total; the trade-off happens in an ideal fluid too."
  ]
},
{
  id: "qz-flu-bernoulli-02",
  conceptId: "flu-bernoulli",
  source: "CED 8.4",
  stem: "Water at 2.0 m/s and $1.80 \\times 10^5$ Pa flows through a horizontal pipe that narrows to one third of its area ($\\rho = 1000$ kg/m$^3$). What is the pressure in the narrow section?",
  options: [
    "$1.96 \\times 10^5$ Pa",
    "$1.80 \\times 10^5$ Pa",
    "$1.64 \\times 10^5$ Pa",
    "$0.20 \\times 10^5$ Pa"
  ],
  answer: 2,
  why: "Continuity gives $v_2 = 6.0$ m/s. Then $\\Delta P = \\frac{1}{2}\\rho(v_2^2 - v_1^2) = \\frac{1}{2}(1000)(36 - 4) = 1.6 \\times 10^4$ Pa of drop, so $P_2 = 1.64 \\times 10^5$ Pa.",
  whyNot: [
    "$1.96 \\times 10^5$ Pa adds the drop instead of subtracting it — the wrong sign for a constriction.",
    "The pressure cannot stay put while the speed triples.",
    "$0.20 \\times 10^5$ Pa subtracts the kinetic term outright rather than the difference of the two."
  ]
},
{
  id: "qz-flu-bernoulli-03",
  conceptId: "flu-bernoulli",
  source: "CED 8.4",
  stem: "A wide open tank has a small hole a depth $\\Delta y$ below the surface. What is the jet's speed, and what is the result called?",
  options: [
    "$v = \\sqrt{2g\\Delta y}$ — Torricelli's result, derived from Bernoulli and not printed on the sheet.",
    "$v = \\sqrt{g\\Delta y}$, derived from continuity.",
    "$v = 2g\\Delta y$, which is on the equation sheet.",
    "$v = \\sqrt{2P_0/\\rho}$, since the atmosphere drives the jet."
  ],
  answer: 0,
  why: "Both points are open to the air so the pressure terms cancel; the tank is wide so the surface descends negligibly slowly. What remains is $\\rho g\\Delta y = \\frac{1}{2}\\rho v^2$, and $\\rho$ cancels — the same speed an object reaches falling freely through $\\Delta y$, which is a strong hint that this was energy conservation all along.",
  whyNot: [
    "The factor of two comes from the energy balance, and continuity is what justifies $v_{top} \\approx 0$ rather than supplying the result.",
    "It is derived rather than printed, and the square root is not optional.",
    "Atmospheric pressure acts on the surface and the hole alike, so it cancels."
  ]
},
{
  id: "qz-flu-bernoulli-04",
  conceptId: "flu-bernoulli",
  source: "CED 8.4",
  stem: "A question asks only for the speed in a narrowed pipe, given the two areas and the initial speed. Why not use Bernoulli?",
  options: [
    "Because Bernoulli does not apply to horizontal pipes.",
    "Because Bernoulli requires the pressure, adding unknowns you cannot solve for; this is a mass-conservation question, so continuity answers it directly.",
    "Because Bernoulli applies only when the fluid is viscous.",
    "Because the two points are not on the same streamline."
  ],
  answer: 1,
  why: "Continuity is one equation in one unknown here. Reaching for Bernoulli imports two pressures that the question never gave you.",
  whyNot: [
    "Horizontal pipes are Bernoulli's most common case.",
    "Bernoulli requires the opposite — no viscosity at all.",
    "Points along a filled pipe are on the same streamline."
  ]
}

];
