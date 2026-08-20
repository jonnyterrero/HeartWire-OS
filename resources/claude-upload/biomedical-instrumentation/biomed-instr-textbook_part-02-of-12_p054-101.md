# Biomedical Instrumentation Textbook

**Source PDF:** `resources/University books/Biomedical_Instrumentation_Textbook.pdf`
**Chunk:** 2 of 12
**Pages:** 54–101

> Auto-extracted text for Claude Project knowledge. Prefer these Markdown parts over uploading the raw PDF.

---

## Page 54

Force
Trace
1
Time
Voltage
R 'C> T
Trace 2
R 'C
Voltage T
Trace 3
Voltage
R
' C^T
Trace 4
Figure 2.3. Output signal of a piezoelectric transducer
under different conditions. Trace
1: Force at the input of
the transducer. Trace 2: Output signal when the product
of R and C is much larger than T; the output voltage is
proportional to the force. Trace 3: Output signal if the
product of R and C is much smaller than T; the output
voltage is proportional to the rate of change of the force.
Trace
4: Output signal
if the product of R and C
is
approximately equal to T; the output signal
is a com-
bination of the two other cases.
the waveform of the resulting signal can occur if these relationships are not
taken into consideration.
The piezoelectric principle
is occasionally used in microphones for
heart sounds or other acoustical signals from within the body. A more im-
portant application of piezoelectric transducers in biomedical instrumenta-
tion is in ultrasonic instruments, where a piezoelectric transducer is used to
both transmit and receive ultrasonic signals.
Principles of ultrasound and
biomedical applications are covered in Chapter 9.

---

## Page 55

2.2.
Active Transducers
33
2.2.3. The Thermoelectric Effect
If two wires of dissimilar metals (e.g., iron and copper) are connected so
that they form a closed conductive loop as shown in Figure 2.4(a), a voltage
can be observed at any point of interruption of the loop which is propor-
tional to the difference in temperature between the two junctions between
the metals. The polarity depends on which of the two junctions is warmer.
The device formed in this fashion is called a thermocouple, shown in Figure
2.4(a). The sensitivity of a thermocouple is small and amounts to only 40
microvolts per degree Celsius
( /iV/°C)
for a copper-constantan and 53
^V/°C for an iron-constantan pair (constantan
is an alloy of nickel and
copper).
The principle of active transducers requires that any electrical energy
delivered at the output of the transducer be obtained from the nonelectrical
variable at the input of the transducer.
In the case of the thermocouple it
might not be quite obvious how the thermal energy is converted.
Actually,
the delivery of electrical energy causes the transfer of heat from the hotter
to the colder junction; the hotter junction gets cooler while the colder junc-
tion gets warmer.
In most practical applications of thermocouples this ef-
fect can be neglected.
Because the thermocouple measures a temperature
difference rather than an absolute temperature, one of the junctions must
be kept at a known reference temperature, usually at the freezing point of
water (0°C or 32 °F).
Frequently, instead of an icebath for the reference
Thermo-voltage
Figure 2.4. Thermocouple (a) princi-
ple;
(b)
thermocouple
with
double
reference
junction
to
connect
to
measurement circuit using copper wire.
Junction
1
Junction 2
(a)
Metal A
Metal B
Copper
Reference
junction
Measurement
junction
(b)

---

## Page 56

34
Basic Transducer Principles
junction, an electronic compensating circuit is used. The inconvenience of
having to make the whole circuit from the two metals used in the thermo-
couple can be overcome by using a double reference junction that connects
to copper conductors as shown in Figure 2.4(b).
Because of their low sensitivity, thermocouples are seldom used for
the measurement of physiological temperatures, where
the temperature
range is so limited. Instead, one of the passive transducers described later is
usually preferred. Thermocouples have an advantage at very high tempera-
tures where passive transducers might not be usable or sometimes where
transducers of minute size are required.
The use of the thermoelectric effect to convert from thermal to elec-
trical energy is called the Seebeck effect. In the reverse direction it is called
the Peltier effect, where the flow of current causes one junction to heat and
the other to cool. The Peltier effect is occasionally used to cool parts of in-
struments (e.g., a microscopic stage).
Se
Fe
P-Si
Contact
J5!5^5j5j5!5i5s^^^5!^5JS^^
\\\\\\\\\\\\\\\\\\\\\\\\\\\W
ri
+
-
N-Si
ri
(a)
Figure 2.5. Photoelectric cells (a) selenium cell;(left) and
silicon (solar) cell (right), (b) Spectral sensitivity of the
two cell types.
100% (—

---

## Page 57

2.3.
Passive Transducers
35
2.2.4. The Photoelectric Effect
The selenium cell, shown in Figure 2.5(a), has long been used to measure the
intensity of light in photographic exposure meters or the light absorption of
chemical solutions. The silicon photoelectric cell, better known as the solar
cell, has a much higher efficiency than the selenium cell.
Its spectral sen-
sitivity peaks in the infrared, however, while that of the selenium
cell
is
maximum in the visible light range. When operated into a small load resist-
ance the current delivered by either cell is proportional to the intensity of
the incident light. The voltage of these cells cannot exceed a certain value
(about 0.6 V for the siHcon cell); if the light intensity or the load resistance is
such that the output voltage approaches this value,
it becomes nonlinear.
2.3.
PASSIVE TRANSDUCERS
Passive transducers utilize the principle of controlling a dc excitation
voltage or an ac carrier signal. The actual transducer consists of a usually
passive circuit element which changes its value as a function of the physical
variable to be measured. The transducer
is part of a circuit, normally an
arrangement similar to a Wheatstone bridge, which is powered by an ac or
dc excitation signal. The voltage at the output of the circuit reflects the
physical variable. There are only three passive circuit elements that can be
utilized
as
passive
transducers:
resistors,
capacitors,
and
inductors.
It
should be noted that active circuit elements,^ vacuum tubes and transistors,
are also occasionally used. This terminology might seem confusing since the
terms '^active" and **passive" have different meanings when they are ap-
plied to transducers than when they are applied to circuit elements. Unlike
active transducers, passive transducers cannot be operated in the reverse
direction (i.e., to convert an electrical signal into a physical variable) since a
different basic principle is involved.
2.3.1.
Passive Transducers Using Resistive Elements
Any resistive element that changes its resistance as a function of a physical
variable can, in principle, be used as a transducer for that variable. An or-
dinary potentiometer, for example, can be used to convert rotary motion or
displacement into a change of resistance. Similarly, the special linear poten-
tiometers shown in Figure 2.6 can be used to convert linear displacement in-
to a resistance change.
The resistivity of conductive materials is a function of temperature. In
resistors this characteristic is a disadvantage; however, in resistive tempera-
ture transducers
it serves a useful purpose. Temperature transducers are
described in more detail in Chapter 9.

---

## Page 58

Linear input-
LINEAR DISPLACEMENT
A
C
B
ROTATIONAL DISPLACEMENT
(a)
Figure 2.6. Linear potentiometer (a) principle; (b) view
of the
device.
(Courtesy of Bourns,
Inc.,
Riverside,
CA.)
Transduction element (potentiometer)
Wiper post
^
o^ \X ^ o
\.
\.
^ Wiper (s)
(one piece)
Transduction element
(b)
36

---

## Page 59

2.3.
Passive Transducers
37
In certain semiconductor materials the conductivity
is increased by
light striking the material. This effect which occurs as a surface effect in cer-
tain polycrystalline materials such as cadmium sulfide,
is used in photo-
resistive ceils, a form of photoelectric transducer. This type of transducer is
very sensitive, but has a somewhat limited frequency response. A different
type of photoelectric transducer
is the photo diode, which utilizes charge
carriers generated by incident radiation in a reverse-biased diode junction.
Although less sensitive than the photoresistive cell, the photodiode has im-
proved frequency response. A photo diode can also be used as a photoelec-
tric transducer without a bias voltage. In this case
it operates as an active
transducer. The photoemissive cell (either vacuum or gas-filled)
is only of
historical interest because
it has generally been replaced by photoelectric
transducers of the semiconductor type.
Most transducers used for mechanical variables utilize a resistive ele-
ment called the strain gage. The principle of a strain gage can easily be
understood with the help of Figure 2.7. Figure 2.7(a) shows a cylindrical
resistor element which has length, L, and cross-sectional area, A.
If
it
is
made of a material having a resistivity of r ohm-cm, its resistance is
R = r*L/A ohms(n).
If an axial force
is applied to the element to cause
it to stretch,
its
length
increases by an amount,
AL,
as shown (exaggerated)
in Figure
2.7(b). This stretching, on the other hand, causes the cross-sectional area of
the cylinder to decrease by an amount A A.
Either an increase in L or a
decrease in A results in an increase in resistance. The ratio of the resulting
resistance change AR/R to the change in length aL/L
is called the gage
factor, G. Thus;
r = ±J^^
AL/L
The gage factor for metals is about 2, whereas the gage factor for silicon (a
crystalline semiconductor material) is about 120.
Figure 2.7.
Principle of strain gage; (a) cylindrical con-
ductor with length, L, and cross sectional area, A. (b)
Application of an axial force has increased the length by
L while the cross sectional area has been reduced by A.

---

## Page 60

Resistance wire
(a)
Figure 2.8. Unbonded strain gage transducer.
(From D.
Bartholomew,
Electrical Measure-
ment and Instruments. AUyn & Bacon,
Inc.,
Boston, MA., by permission.)
The basic principle of the strain gage can be utilized for transducers in
a number of different ways. In the mercury strain gage the resistive material
consists of a column of mercury enclosed in a piece of silicone rubber tub-
ing. The use of this type of strain gage for the measurement of physiological
variables (the diameter of blood vessels) was
first described by Whitney.
Mercury strain gages are, therefore, sometimes called Whitney gages. An
application of this type of transducer, the mercury strain gage plethysmo-
graphy
is described in Chapter 6. Because the silicone rubber yields easily to
stretching
forces, mercury
strain gages
are
frequently used
to measure
changes in the diameter of body sections or organs. A disadvantage is that
for practical dimensions the resistance of the mercury columns is inconven-
iently low (usually only a few ohms). This problem can be overcome by
substituting an electrolyte solution for the mercury. However, silicone rub-
ber
is permeable to water vapor, so elastomers other than silicone rubber
have to be used as the enclosures for gages containing electrolytes.
When metallic strain gages are used rather than mercury, the possible
amount of stretching and the corresponding resistance changes are much
more limited. Metal strain gages can be of two different types: unbonded
and bonded. In the unbonded strain gage, thin wire is stretched between in-
sulating posts as shown in Figure 2.8(a). In order to obtain a convenient
resistance (120 n
is a common value), several turns of wire must be used.
Here the moving part of the transducer is connected to the stationary frame
by four unbonded strain gages,
/?, through R^.
If the moving member
is
forced to the right, R2 and R^ are stretched and their resistance increases
while the stress in /?, and R^
is reduced, thus decreasing the resistance of
these strain gage wires. By connecting the four strain gages into a bridge cir-
cuit as shown in Figure 2.8(b),
all resistance changes influence the output
voltage in the same direction, increasing the sensitivity of the transducer by
38

---

## Page 61

2.3.
Passive Transducers
39
a factor of 4. At the same time, resistance changes of the strain gage due to
changing temperatures tend to compensate each other. In the form shown,
the unbonded strain gage is basically a force transducer. The same principle
is also utilized in transducers for other variables. For example, the blood
pressure transducers shown in Chapter 6 employ unbonded strain gages as
the transducer elements.
The principle of the bonded strain gage is shown in Figure 2.9. A thin
wire shaped in a zigzag pattern is cemented between two paper covers or is
cemented to the surface of a paper carrier. This strain gage is then cemented
to the surface of a structure. Any changes in surface dimensions of the
structure due to mechanical strain are transmitted to the resistance wire,
causing an increase or decrease of its length and a corresponding resistance
change. The bonded strain gage, therefore, is basically a transducer for sur-
face strain.
Related to the bonded wire strain gage is ihQ foil gage. In this gage the
conductor consists of a foil pattern on a substrate of plastic which is manu-
factured by the same photoetching techniques as those used in printed cir-
cuit boards. This process permits the manufacture of smaller gages with
more compUcated gage patterns (rosettes), which allow the measurement of
different strain components.
In semiconductor strain gages a small slice of silicon replaces the wire
or
foil pattern as a conductor. Because of the crystalline nature of the
silicon, these strain gages have a much larger gage factor than metal strain
gages. Typical values are as high as
120. By varying the amount of im-
Top cover
(thin paper)
Figure 2.9. Typical bonded
strain gage configuration.
Strain gage wire
grid.
(this is cemented
between the bottom
and top covers when
assembled.)
Bottom cover
(thin paper)

---

## Page 62

40
Basic Transducer Principles
purities
in
the
silicon
its
conductivity can be
controlled. With modern
manufacturing
techniques
developed
for
semiconductor
components,
silicon strain gages can be made even smaller than the smallest foil gages. If
the structure whose surface strain is to be measured is also made of silicon
(e.g, in the shape of a beam or diaphragm), the size of the strain gage can be
reduced even further by manufacturing it as a resistive pattern on the siHcon
surface. Such patterns can be obtained using the photolithographic and dif-
fusion techniques developed for the manufacture of integrated circuits. The
gages are isolated from the silicon substrate by reverse-biased diode junctions.
As with the unbonded gage, the resistance of a bonded strain gage is in-
fluenced by a change in temperature.
In semiconductor strain gages, these
changes are even more pronounced. Therefore,
at
least two strain-gage
elements are usually used, with the second element either employed strictly for
temperature compensation, or £is part of a bridge in an arrangement similar to
that shown in Figure 2.8(b) to increase the transducer sensitivity at the same
time.
2.3.2.
Passive Transducers Using Inductive Elements
In principle, the inductance of a coil can be changed either by varying its
physical dimensions or by changing the effective permeability of its magnetic
core. The latter can be achieved by moving a core having a permeability higher
than air through the coil as shown in Figure 2.10. This arrangement appears to
be very similar to that of an inductive transducer. However, in the inductive
transducer the core
is a permanent magnet which when moved induces a
voltage in the coil.
In this passive transducer the core
is made of a soft
magnetic material which changes the inductance of the coil when it is moved
inside. The inductance can then be measured using an ac signal.
Figure 2.10. Example of variable in-
ductance displacement transducer.
Displacement
Another passive transducer involving inductance is the variable reluc-
tance transducer, in which the core remains stationary but the air gap in the
magnetic path of the core
is varied to change the effective permeability.
This principle is also used in active transducers in which the magnetic path
includes a permanent magnet.
The inductance of the coil in these types of transducers is usually not
related linearly to the displacement of the core or the size of the air gap,
especially
if large displacements are encountered. The linear variable dif-
ferential transformer (LVDT), shown in Figure 2.11, overcomes this hmita-

---

## Page 63

Primary
Figure 2.11.
Differen-
tial transformer sche-
matic.
Secondary
1
Secondary 2
Output
Movable core
Linear
input
tion. It consists of a transformer with one primary and two secondary wind-
ings. The secondary windings are connected so that their induced voltages
oppose each other.
If the core
is in the center position, as shown in the
figure, the voltages in the two secondary windings are equal in magnitude
and the resulting output voltage is zero. If the core is moved upward as in-
dicated by the arrow, the voltage in secondary
1
increases while that in
secondary 2 decreases. The magnitude of the output voltage changes with
the amount of displacement of the core from its central or neutral position.
Its phase with respect to the voltage at the primary winding depends on the
direction of the displacement. Because nonlinearities in the magnitudes of
the voltages induced in the two output coils tend to compensate each other,
the output voltage of the differential transducer
is proportional to core
movement even with fairly large displacements.
2.3.3.
Passive Transducers Using Capacitive Elements
The capacitance of a plate capacitor can be changed by varying the physical
dimensions of the plate structure or by varying the dielectric constant of the
medium between the capacitor plates. Both effects have occasionally been
used
in
the
design
of
transducers
for
biomedical
applications.
The
capacitance plethysmograph shown in Chapter 6 is an example. As with the
transducers
using
an
inductive
element,
it
is
sometimes
not
apparent
whether a capacitive transducer is of the passive type or is actually an active
transducer utiHzing the principle of electric induction. If there is doubt, an
examination of the
carrier
signal can help
in the
classification.
Passive
transducers
utilize
ac
carriers,
whereas
a
dc
bias
voltage
is
used
in
transducers based on the principle of electric induction.
2.3.4.
Passive Transducers Using Active Circuit Elements
The distinction between
**active*' and
**passive" when used
for
circuit
elements
is based on a
different
principle than
that which
is used
for
transducers. Active circuit elements are those which provide power gain for
41

---

## Page 64

42
Basic Transducer Principles
a signal (i.e., vacuum tubes and transistors). Such circuit elements have oc-
casionally been used as transducers. Because, as transducers they employ
the principle of carrier modulation (the carrier being the plate or collector
voltage), these active circuit elements are nevertheless passive transducers,
by definition. A variable-transconductance vacuum tube in which the distance
between the control grid and cathode of a vacuum tube was changed by the
displacement of a mechanical connection is an early example of this type of
transducer. More recently, transistors have been manufactured in which a
mechanical force applied to the base region of the planar transistor causes a
change in the current gain.
The most important application of active circuit elements in passive
transducers is in the area of photoelectric transducers. The photomultiplier
consists of a photoemissive cathode of the type used in photoemissive cells.
When struck by photons, the electrons emitted by the cathode are amplified
by
several
stages of secondary emission electrodes
called dynodes. The
photomultiplier is still the most sensitive light detector. One of its appHca-
tions for biomedical purposes
is in the scintillation detector for nuclear
radiation described in Chapter 14.
The sensitivity of a photo diode can be increased if the reverse-biased
diode is incorporated into a transistor as the collector-base junction to form
a photo
transistor.
In
this device, the photo-diode current
is essentially
ampUfied by the transistor and appears at the collector, multiplied by the
current gain. In the photo Darlington, a photo transistor is connected to a
second transistor on the same substrate, with the two transistors forming a
Darlington
circuit.
This
effectively
multiplies
the photo
current of the
collector-base junction of the first transistor by the product of the current
gains of both transistors. This arrangement makes the photo Darlington a
very sensitive transducer.
Another semiconductor transducer element
is
the Hall generator,
which provides an output voltage that is proportional to both the applied
current and any magnetic field in which
it is placed.
2.4.
TRANSDUCERS FOR BIOMEDICAL APPLICATIONS
Several basic physical variables and the transducers (active or passive)
used to measure them are listed in Table 2.2.
It should be noted that many
variables of great interest in biomedical applications, such as pressure and
fluid or gas flow, are not included. These and many other variables of in-
terest can be measured, however, by first converting each of them into one
of the variables for which basic transducers are available. Some very in-
genious methods have been developed to convert some of the more elusive
quantities for measurement by one of the transducers described.

---

## Page 65

2. 4.
Transducers for Biomedical Applications
Table 2.2. BASIC TRANSDUCERS
Physical Variable
Type of Transducer
Force (or pressure)
Piezoelectric
Unbonded strain gage
Displacement
Variable resistance
Variable capacitance
Variable inductance
Linear variable differential transducer
Mercury strain gage
Surface strain
Strain gage
Velocity
Magnetic induction
Temperature
Thermocouple
Thermistor
Light
Photovoltaic
Photoresistive
Magnetic field
Hall effect
^In medical applications the basic physiological variables is first
transformed into one of the physical variables listed. Examples
would be measurement of blood pressure using strain gages
and blood flow by magnetic induction.
2.4.1.
Force Transducers
A design element frequently used for the conversion of physical variables is
the force-summing member. One possible configuration of this device
is
shown in Figure 2.12(a). In this case, the force-summing member is a leaf
spring. When the spring
is bent downward,
it exerts an upward-directed
force that is proportional to the displacement of the end of the spring. If a
force is applied to the end of the spring in a downward direction, the spring
bends until its upward-directed force equals the downward-directed appHed
force, or, expressed differently, until the vector sum of both forces equals
zero. From this
it derives its name
** force-summing member.*' In the con-
figuration shown, the force-summing member can be used to convert a
force into a variable for which transducers are more readily available. The
bending of the spring, for example, results in a surface strain that can be
measured by means of bonded strain gages as shown in Figure 2.12(b).
The
transducers shown
in Figure
2.13
utilize
this
principle. The
photographs illustrate that force and displacement transducers are closely
related. Sometimes, the terms isotonic and isometric are used to describe the
characteristics of these transducers.
Ideally a force transducer would be
isometric; that is,
it would not yield (change its dimensions) when a force is
applied. On the other hand, a displacement transducer would be isotonic
and offer zero or a constant resistance to an applied displacement. In reality,
almost all transducers combine the characteristics of both ideal transducer

---

## Page 66

Force
Displacement
(a)
(b)
Lamp
^ J\
V
Shutter
Photo resistor
(0
(d)
Figure 2.12. Force transducers using various transduction principles,
(a) The force summing member, here in the form of a leaf spring, (b)
Force transducer with bonded strain gages, (c) Force transducer us-
ing a differential transformer, (d) Force transducer using a lamp and
photo resistor to measure the displacement of the force summing
member.
Figure
2.13. Force-displacement
transducer
with
bonded
strain
gage. (Courtesy of Biocom, Inc., Culver City, CA.)
44

---

## Page 67

Output connector
to physiograph
Force element
(a)
Figure
2.14.
Photoelectric
displacement
transducer:
(a)
block
diagram; (b) photograph. (Courtesy of Narco BioSystems, Houston,
TX.)
(b)
45

---

## Page 68

4s
Basic Transducer Principles
types.
Figure 2.13,
for example, shows the same basic transducer type
equipped with two different springs. With the long, soft spring shown in the
upper photograph, the transducer assumes the characteristics of an isotonic
displacement transducer. With the short,
stiff spring shown in the lower
photograph,
it becomes an isometric force transducer.
Figure 2.12(c) shows measurement of displacement using a differen-
tial transformer transducer. A
less frequently used type of displacement
transducer is shown in Figure 2.12(d). Here the displacement of a spring is
used to modulate the intensity of a light beam via a mechanical shutter. The
resulting light intensity is measured by a photoresistive cell. In this example,
a
multiple
conversion of
variables
takes
place:
force
to
displacement,
displacement to light intensity, and light intensity to resistance. This prin-
ciple
is actually employed in the commercial transducer shown in Figure
2.14.
2.4.2. Transducers for Displacement, Velocity,
and Acceleration
Displacement, A velocity, V, and acceleration. A, are linked by the follow-
ing relationships:
K= —
A =— =^!R
dt
dt
dt'
and the inverse:
^
^
^^
V = J A dt
D = J Vdt =JI A (dt)'
If any one of the three variables can be measured,
it is possible—at least in
principle—to obtain the other two variables by integration or differentia-
tion. Both operations can
readily be performed by
electronic methods
operating on either analog or digital signals. Expressed in the frequency
domain, the integration of a signal corresponds to a lowpass filter with a
slope of 6 dB/octave, whereas differentiation corresponds to a highpass
filter with the same slope. Because the performance of analog circuits
is
limited by bandwidth and noise considerations, integration and differentia-
tion of analog signals
is possible only within a limited frequency range.
Usually, integration poses fewer problems than differentiation.
It should
also be noted that discontinuities in the transducer characteristic (e.g., the
finite resolution of a potentiometric transducer in which the resistive ele-
ment is of the wire-wound type) are greatly enhanced by the differentiation
process.
Table 2.2 shows that transducers for displacement and velocity are
readily available. However, the principles listed for these measurements re-
quire that part of the transducer be attached to the body structure whose
displacement, velocity, or acceleration is to be measured, and that a refer-
ence point be available. Since these two conditions cannot always be met in

---

## Page 69

2. 4.
Transducers for Biomedical Applica tions
47
biomedical applications, indirect methods sometimes have to be used. Con-
tactless methods for measuring displacement and velocity, based on optical
or magnetic principles, are occasionally used. Magnetic methods usually re-
quire that a small magnet or piece of metal be attached to the body struc-
ture. Ultrasonic methods, described in Chapter 9, are used more frequently.
2.4.3.
Pressure Transducers
Pressure transducers are closely related to force transducers. Some of the
force-summing members used in pressure transducers are shown in Figure
2.15. Pressure transducers utilizing flat diaphragms normally have bonded
or semiconductor
strain gages attached directly to the diaphragms. The
small implantable pressure transducer shown in Chapter 6 is of this design.
Even smaller dimensions are possible if the diaphragm is made directly from
a thin silicon wafer with the strain gages diffused into its surface. The cor-
rugated diaphragm lends itself to the design of pressure transducers using
unbonded strain gages or a differential transformer as the transducer ele-
ment. The LVDT blood pressure transducer shown in Chapter 6 uses these
principles. Flat or corrugated diaphragms have also occasionally been used in
transducers which employ the variable reluctance or variable capacitance
principles. Although diaphragm-type pressure transducers can be designed
for a wide range of operating pressures, depending on the diameter and stiff-
ness of the diaphragm, Bourdon tube transducers are usually used for high
pressure ranges.
It should be noted that the amount of deformation of the
force-
summing member
in a pressure transducer actually depends on the
dif-
ference in the pressure between the two sides of the diaphragm. If absolute
pressure
is to be measured, there must be a vacuum on one side of the
diaphragm.
It
is much more common to measure the pressure relative to
atmospheric pressure by exposing one side of the diaphragm to the atmo-
sphere. In differential pressure transducers the two pressures are applied to
opposite sides of the diaphragm.
Figure 2.15. Force-summing members used in pressure transducers;
(a)
flat diaphragm;
(b) corrugated diaphragm;
(c) Bourdon tube.
(Dashed line shows new position by motion.)
Z7^— —L/:^
cvj
—
I
J
(a)
(b)
(c)

---

## Page 70

48
Basic Transducer Principles
2.4.4.
Flow Transducers
The flow rate of fluids or gases is a very elusive variable and many different
methods have been developed to measure it. These methods are described in
detail in Chapter 6 for blood flow and cardiac output, and in Chapter 8 for
the measurement of gas flow as used in measurements in the respiratory
system.
2.4.5. Transducers with Digital Output
Increasingly,
biomedical
instrumentation
systems
are
utilizing
digital
methods for the processing of data, which require that any data entered into
the system be in digital rather than in analog form. Analog-to-digital con-
verters, described in Chapter 15, can be used to convert an analog trans-
ducer output into digital form.
It
is often desirable to have a transducer
whose output signal originates in digital form. Although such transducers
are very limited in their application, they are available for measurement of
linear or rotary displacement. These transducers contain encoding disks or
rulers with
digital patterns (see Figure 2.16) photographically etched on
glass plates. A light source and an array of photodetectors, usually made up
of photos diodes or photo transistors, are used to obtain a digital signal in
parallel format
that
indicates
the
position of the encoding
plate, and
thereby represents the displacement being measured.
Figure 2.16.
Digital shaft encoder patterns. (Courtesy of Itek,
Wayne George Division, Newborn, MA.)

---

## Page 71

3
Sources of
Bioelectric
Potentials
In carrying out their various functions, certain systems of the body
generate their own monitoring
signals, which convey useful information
about the functions they represent. These signals are the bioelectric poten-
tials associated with nerve conduction, brain activity, heartbeat, muscle ac-
tivity, and so on. Bioelectric potentials are actually ionic voltages produced
as a result of the electrochemical activity of certain special types of cells.
Through the use of transducers capable of converting ionic potentials into
electrical voltages, these natural monitoring signals can be measured and
results displayed in a meaningful way to aid the physician in his diagnosis
and treatment of various diseases.
The idea of electricity being generated in the body goes back as far as
1786, when an Italian anatomy professor, Luigi Galvani, claimed to have
found electricity in the muscle of a frog's leg. In the century that followed
several other scientists discovered electrical activity in various animals and
in man. But
it was not
until
1903, when the Dutch physician Willem
49

---

## Page 72

gp
Sources of Bioelectric Potentials
Einthoven introduced the string galvanometer, that any practical applica-
tion could be made of these potentials. The advent of the vacuum tube and
amplification and, more recently, of solid-state technology has made possi-
ble better representation of the bioelectric potentials. These developments,
combined with a
large amount of physiological research
activity, have
opened many new avenues of knowledge in the application and interpreta-
tion of these important signals.
3.1.
RESTING AND ACTION POTENTIALS
Certain types of cells within the body, such as nerve and muscle cells,
are encased in a semipermeable membrane that permits some substances to
pass through the membrane while others are kept out. Neither the exact
structure of the membrane nor the mechanism by which its permeability is
controlled
is known, but the substances involved have been identified by
experimentation.
Surrounding the cells of the body are the body fluids. These fluids are
conductive solutions containing charged atoms known as ions. The prin-
cipal ions are sodium (Na+), potassium (K+), and chloride (C-). The
membrane of excitable cells readily permits entry of potassium and chloride
ions but effectively blocks the entry of sodium ions. Since the various ions
seek a balance between the inside of the cell and the outside, both accord-
ing to concentration and
electric charge, the inability of the sodium to
penetrate the membrane results in two conditions. First, the concentration
of sodium ions inside the cell becomes much lower than in the intercellular
fluid outside. Since the sodium ions are positive, this would tend to make
the outside of the cell more positive than the inside. Second, in an attempt
to balance the electric charge, additional potassium ions, which are also
positive, enter the cell, causing a higher concentration of potassium on the
inside
than on
the
outside.
This
charge
balance cannot be
achieved,
however,
because
of
the
concentration
imbalance
of
potassium
ions.
Equilibrium
is reached with a potential difference across the membrane,
negative on the inside and positive on the outside.
This membrane potential is called the resting potential of the cell and
is maintained until some kind of disturbance upsets the equilibrium. Since
measurement of the membrane potential is generally made from inside the
cell with respect to the body fluids, the resting potential of a cell is given as
negative. Research investigators have reported measuring membrane poten-
tials in various cells ranging from - 60 to - 100 mV. Figure 3.1 illustrates in
simplified form the cross section of a cell with its resting potential. A cell in
the resting state is said to be polarized.

---

## Page 73

70 mV
Figure 3.1.
Polarized cell with
its resting potential.
When a section of the cell membrane
is excited by the flow of ionic
current
or by some form of
externally
applied
energy,
the membrane
changes its characteristics and begins to allow some of the sodium ions to
enter. This movement of sodium ions into the cell constitutes an ionic cur-
rent flow that further reduces the barrier of the membrane to sodium ions.
The net result is an avalanche effect in which sodium ions literally rush into
the cell to try to reach a balance with the ions outside. At the same time
potassium ions, which were in higher concentration inside the cell during
the resting state, try to leave the cell but are unable to move as rapidly as the
sodium ions. As a result, the cell has a slightly positive potential on the in-
side due to the imbalance of potassium ions. This potential is known as the
action potential and is approximately + 20 mV. A cell that has been excited
and that displays an action potential is said to be depolarized; the process of
changing from the resting state to the action potential is called depolariza-
tion. Figure 3.2 shows the ionic movements associated with depolarization,
and Figure 3.3 illustrates the cross section of a depolarized cell.
Figure 3.2. Depolarization of a
cell.
Na "^ ions rush into the cell while K
•"
ions attempt to leave.
51

---

## Page 74

+ 20mV
Figure 3.3. Depolarized cell during an action potential.
Once the rush of sodium ions through the cell membrane has stopped
(a new state of equilibrium is reached), the ionic currents that lowered the
barrier to sodium ions are no longer present and the membrane reverts back
to
its
original,
selectively permeable condition, wherein the passage of
sodium ions from the outside to the inside of the cell is again blocked. Were
this the only effect, however,
it would take a long time for a resting poten-
tial to develop again. But such is not the case. By an active process, called a
sodium pump, the sodium ions are quickly transported to the outside of the
cell, and the cell again becomes polarized and assumes its resting potential.
This process is called repolarization. Although little is known of the exact
chemical steps involved in the sodium pump,
it is quite generally believed
that sodium is withdrawn against both charge and concentration gradients
supported by some form of high-energy phosphate compound. The rate of
pumping is directly proportional to the sodium concentration in the cell. It
Figure 3.4. Waveform of the action potential. (Time
scale varies with type of cell.)
Action
potential

---

## Page 75

3.2.
Propagation ofAction Potentials
S3
is also believed that the operation of this pump is linked with the influx of
potassium into the
cell,
as
if a cyclic process involving an exchange of
sodium for potassium existed.
Figure 3.4 shows a typical action-potential waveform, beginning at the
resting potential, depolarizing, and returning to the resting potential after
repolarization. The time scale for the action potential depends on the type
of cell producing the potential. In nerve and muscle cells, repolarization
occurs so rapidly following depolarization that the action potential appears
as a spike of as little as
1 msec total duration. Heart muscle, on the other
hand, repolarizes much more slowly, with the action potential for heart
muscle usually lasting from 150 to 300 msec.
Regardless of the method by which a cell is excited or the intensity of
the stimulus (provided
it is sufficient to activate the cell), the action poten-
tial is always the same for any given cell. This is known as the all-or-nothing
law. The net height of the action potential is defined as the difference be-
tween the potential of the depolarized membrane at the peak of the action
potential and the resting potential.
Following the generation of an action potential, there is a brief period
of time during which the
cell cannot respond to any new stimulus. This
period, called the absolute refractory period,
lasts about
1 msec in nerve
cells.
Following
the absolute
refractory
period,
there occurs
a
relative
refractory period, during which another action potential can be triggered,
but a much stronger stimulation
is required.
In nerve
cells, the relative
refractory period
lasts several milliseconds. These refractory periods are
believed to be the result of after-potentials that follow an action potential.
3.2.
PROPAGATION OF ACTION POTENTIALS
When a cell is excited and generates an action potential ionic currents
begin to flow. This process can, in turn, excite neighboring cells or adjacent
areas of the same cell. In the case of a nerve cell with a long fiber, the action
potential is generated over a very small segment of the fiber's length but is
propagated
in both
directions from the original point of excitation.
In
nature, nerve cells are excited only near their
**input end'* (see Chapter 10
for details). As the action potential travels down the fiber, it cannot reexcite
the portion of the fiber immediately upstream, because of the refractory
period that follows the action potential.
The rate at which an action potential moves down a fiber or is pro-
pagated from cell to cell is called the propagation rate. In nerve fibers the
propagation rate
is also called the nerve conduction rate,
or conduction
velocity. This velocity varies widely, depending on the type and diameter of
the nerve fiber. The usual velocity range in nerves is from 20 to 140 meters

---

## Page 76

54
Sources of Bioelectric Potentials
per second (m/sec). Propagation through heart muscle is slower, with an
average rate from 0.2 to 0.4 m/sec. Special time-delay fibers between the
atria and ventricles of the heart cause action potentials to propagate at an
even slower rate, 0.03 to 0.05 m/sec.
3.3.
THE BIOELECTRIC POTENTIALS
To measure bioelectric potentials, a transducer capable of converting
ionic potentials and currents into electric potentials and currents is required.
Such
a transducer
consists of two
electrodes,
which measure the
ionic
potential difference between their respective points of appUcation. Elec-
trodes are discussed in detail in Chapter 4.
Although measurement of individual action potentials can be made in
some types of cells, such measurements are difficult because they require
precise placement of an electrode inside a cell. The more common form of
measured biopotentials is the combined effect of a large number of action
potentials as they appear at the surface of the body, or at one or more elec-
trodes inserted into a muscle, nerve, or some part of the brain.
The exact method by which these potentials reach the surface of the
body is not known. A number of theories have been advanced that seem to
explain most of the observed phenomena fairly well, but none exactly fits
the situation. Many attempts have been made, for example, to explain the
biopotentials from the heart as they appear at the surface of the body.
According to one theory, the surface pattern is a summation of the poten-
tials developed by the electric fields set up by the ionic currents that generate
the individual action potentials. This theory, although plausible, fails to ex-
plain a number of the characteristics indicated by the observed surface pat-
terns. A closer approximation can be obtained if it is assumed that the sur-
face pattern is a function of the summation of the first derivatives (rates of
change) of
all the individual action potentials,
instead of the potentials
themselves. Part of the difficulty arises from the numerous assumptions
that must be made concerning the ionic current and electric field patterns
throughout the body. The validity of some of these assumptions
is con-
sidered somewhat questionable. Regardless of the method by which these
patterns of potentials reach the surface of the body or implanted measuring
electrodes, they can be measured as specific bioelectric signal patterns that
have been studied extensively and can be defined quite well.
The remainder of this chapter is devoted to a description of each of the
more significant bioelectric potential waveforms. The designation of the wave-
form itself generally ends in the suffix gram, whereas the name of the in-
strument used to measure the potentials and graphically reproduce the wave-
form ends in the suffix graph. For example, the electrocardiogram
(the
name of the waveform
resulting from the
heart's
electrical
activity)
is

---

## Page 77

3.3.
The Bioelectric Potentials
55
measured on an electrocardiograph (the instrument). Ranges of amplitudes
and frequency spectra for each of the biopotential waveforms described
below are included in Appendix B.
3.3.1. The Electrocardiogram (ECG)
The biopotentials generated by the muscles of the heart result in the electro-
cardiogram, abbreviated ECG (sometimes EKG, from the German electro-
kardiogram). To understand the origin of the ECG, it is necessary to have some
familiarity with the anatomy of the heart. Figure 3.5 shows a cross section of
the interior of the heart. The heart is divided into four chambers. The two upper
chambers, the left and right atria, are synchronized to act together. Similarly,
the two lower chambers, the ventricles, operate together. The right atrium
receives blood from the veins of the body and pumps it into the right ventri-
cle. The right ventricle pumps the blood through the lungs, where
it
is
oxygenated. The oxygen-enriched blood then enters the left atrium, from
which
it
is pumped into the
left
ventricle. The
left ventricle pumps the
blood into the arteries to circulate throughout the body. Because the ven-
tricles actually pump the blood through the vessels (and therefore do most
of the work), the ventricular muscles are much larger and more important
than the muscles of the atria. For the cardiovascular system to function prop-
erly, both the atria and the ventricles must operate in a proper time rela-
tionship.
Each action potential in the heart originates near the top of the right
atrium at a point called the pacemaker or sinoatrial (SA) node. The pace-
maker
is a group of specialized
cells that spontaneously generate action
potentials at a regular rate, although the rate is controlled by innervation.
To initiate the heartbeat, the action potentials generated by the pacemaker
propagate in all directions along the surface of both atria. The wavefront of
activation travels parallel to the surface of the atria toward the junction of
the atria and the ventricles. The wave terminates at a point near the center
of the heart,
called the atrioventricular (AV) node. At this point, some
special fibers act as a **delay line" to provide proper timing between the
action of the atria and the ventricles. Once the electrical excitation has passed
through the delay line,
it is rapidly spread to all parts of both ventricles by
the bundle of His (pronounced "hiss"). The fibers in this bundle, called
Purkinje fibers,
divide
into two
branches
to
initiate
action
potentials
simultaneously
in the powerful musculature of the two
ventricles. The
wavefront in the ventricles does not follow along the surface but is perpen-
dicular to it and moves from the inside to the outside of the ventricular wall,
terminating at the tip or apex of the heart. As indicated earlier, a wave of
repolarization follows the depolarization wave by about 0.2 to 0.4 second. This
repolarization, however,
is not initiated from neighboring muscle cells but
occurs as each cell returns to its resting potential independently.

---

## Page 78

Brachiocephalic
trunk
Right pulmona^
artery
Right pulmonary
veins
Pulmonary semilunar
valve
Right atrium
Tricuspid
( right
atrioventricular) valve
Chordae tendinae
Left common carotid artery
^Left subclavian artery
jimonary
trunk
Aorta
Left pulmonary artery
Left pulmonary
veins
Left
atrium
Aortic semilunar
valve
cuspid
(left
atrioventricular)
valve
Inferior
vena cava
Left
ventricle
Papillary muscle
Descending
aorta
Right ventricle
(a)
Figure 3.5. The heart: (a) internal structure; (b) con-
ducting system. (From W.F. Evans, Anatomy and
Physiology, The Basic Principles, Englewood Cliffs,
N.J.,
Prentice-Hall,
Inc.,
1971, by permission.)
Cardiac
(cardioaccelerator
nerves)
Vagus nerve
(cardioinhibitor nerve)

---

## Page 79

s
Figure 3.6. The electrocardiogram waveform.
Figure 3.6 shows a typical ECG as it appears when recorded from the
surface of the body. Alphabetic designations have been given to each of the
prominent features. These can be identified with events related to the action
potential propagation pattern. To facilitate analysis, the horizontal segment
of this waveform preceding the P wave is designated as the baseline or the
isopotential
line.
The P
wave
represents
depolarization
of
the
atrial
musculature. The QRS complex is the combined result of the repolarization
of the atria and the depolarization of the ventricles, which occur almost
simultaneously. The T wave
is
the wave of ventricular
repolarization,
whereas the U wave, if present, is generally believed to be the result of after-
potentials in the ventricular muscle. The P-Q interval represents the time
during which the excitation wave is delayed in the fibers near the AV node.
The shape and polarity of each of these features vary with the location
of the measuring electrodes with respect to the heart, and a cardiologist nor-
mally bases his diagnosis on readings taken from several electrode loca-
tions. Measurement of the electrocardiogram
is covered in more detail in
Chapter 6.
3.3.2. The Electroencephalogram (EEG)
The recorded
representation
of
bioelectric
potentials
generated by
the
neuronal activity of the brain is called the electroencephalogram, abbreviated
EEG. The EEG has a very complex pattern, which is much more difficult to
recognize than the ECG. A typical sample of the EEG is shown in Figure
3.7. As can be seen, the waveform varies greatly with the location of the
measuring electrodes on the surface of the scalp. EEG potentials, measured
at the surface of the scalp, actually represent the combined effect of poten-
tials from a fairly wide region of the cerebral cortex and from various points
beneath.

---

## Page 80

*(No extractable text on this page)*

---

## Page 81

3.3.
The Bioelectric Potentials
59
Experiments have shown that the frequency of the EEG seems to be
affected by the mental activity of a person. The wide variation among in-
dividuals and the lack of repeatability in a given person from one occasion
to another make the establishment of specific relationships difficult. There
are, however, certain characteristic EEG waveforms that can be related to
epileptic seizures and sleep. The waveforms associated with the different
stages of sleep are shown in Figure 3.8. An alert, wide-awake person usually
displays an unsynchronized high-frequency EEG. A drowsy person, par-
ticularly one whose eyes are closed,
often produces a large amount of
rhythmic activity in the range 8 to 13 Hz. As the person begins to fall asleep,
the amplitude and frequency of the waveform decrease; and in light sleep, a
large-amplitude, low-frequency waveform emerges. Deeper sleep generally
results
in
even
slower and
higher-amplitude
waves. At
certain
times,
however, a person,
still sound asleep, breaks into an unsynchronized high-
frequency EEG pattern for a time and then returns to the low-frequency
sleep pattern. The period of high-frequency EEG that occurs during sleep is
called paradoxical sleep, because the EEG
is more like that of an awake,
alert person than of one who is asleep. Another name is rapid eye movement
(REM) sleep, because associated with the high-frequency EEG
is a large
amount of rapid eye movement beneath the closed eyelids. This phenomenon
is often associated with dreaming, although
it has not been shown con-
clusively that dreaming is related to REM sleep.
The various frequency ranges of the EEG have arbitrarily been given
Greek letter designations because frequency seems to be the most prominent
feature of an EEG pattern. Electroencephalographers do not agree on the
exact
ranges,
but most
classify
the EEG
frequency bands
or rhythms
approximately as follows:
Below 3!/2 Hz
delta
From V/i Hz to about 8 Hz
theta
From about 8 Hz to about 13 Hz
alpha
Above 13 Hz
beta
Portions of some of these ranges have been given special designations, as
have certain subbands that
fall on or near the stated boundaries. Most
humans seem to develop EEG patterns in the alpha range when they are
relaxed with their eyes closed. This condition seems to represent a form of
synchronization, almost Hke a
'^natural"
or
**idhng''
frequency of the
brain. As soon as the person becomes alert or begins **thinking,'' the alpha
rhythm
disappears
and
is
replaced
with
a
**desynchronized*'
pattern,
generally in the beta range. Much research is presently devoted to attempts
to
learn
the
physiological
sources
in
the
brain
responsible
for
these
phenomena, but so far nothing conclusive has resulted.

---

## Page 82

Hl,%tt^^Wf^'V'^^
^*^^'W^V"*^\nl(**i*Nflk*tif*^
\\/*^i(t\
vv»,yw|^««'^"v»i^/fl(!^\wfVVv
(a)
(b)
»^/.Jlj/>V
(c)
I
(d)
(f)
I
Voltage Scale:
50 microvolts
100 microvolts
Figure
3.8. Typical human EEG patterns
for different
stages of
sleep. In each case the upper record is from the left frontal region of
the brain and the lower tracing is from the right occipital region, (a)
Awake and alert—mixed EEG frequencies; (b) Stage 1—subject
is
drowsy and produces large amount of alpha waves; (c) Stage 2—light
sleep; (e) Stage 4—deeper slow wave sleep; (0 Paradoxical or rapid
eye movement (REM)
sleep.
(Courtesy Veterans Administration
Hospital, Sepulveda, CA.)

---

## Page 83

3.3.
The Bioelectric Potentials
$^
Experiments
in biofeedback have shown that under certain condi-
tions, people can learn to control their EEG patterns to some extent when
information concerning their EEG
is fed back to them either visibly or
audibly. The reader is referred to the section on biofeedback in Chapter
1 1
As indicated, the frequency content of the EEG pattern seems to be
extremely important. In addition, phase relationships between similar EEG
patterns from different parts of the brain are also of great interest. Infor-
mation of this type may lead to discoveries of EEG sources and will, hope-
fully, provide additional knowledge regarding the functioning of the brain.
Another form of EEG measurement is the evoked response. This is a
measure of the
** disturbance'* in the EEG pattern that results from external
stimuh, such as a flash of light or a cHck of sound. Since these **disturb-
ance" responses are quite repeatable from one flash or click to the next, the
evoked response can be distinguished from the remainder of EEG activity,
and from the noise, by averaging techniques. These techniques, as well as
other methods of measuring EEG, are covered in Chapter 10.
3.3.3.
Electromyogram (EMG)
The bioelectric potentials associated with muscle activity constitute the elec-
tromyogram, abbreviated EMG. These potentials may be measured at the
surface of the body near a muscle of interest or directly from the muscle by
penetrating the skin with needle electrodes. Since most EMG measurements
are intended to obtain an indication of the amount of activity of a given
muscle, or group of muscles, rather than of an individual muscle fiber, the
pattern is usually a summation of the individual action potentials from the
fibers constituting the muscle or muscles being measured. As with the EEG,
EMG electrodes pick up potentials from all muscles within the range of the
electrodes.
This means
that
potentials from nearby
large muscles may
interfere with attempts to measure the EMG from smaller muscles, even
though the electrodes are placed directly over the small muscles. Where this
is
a
problem,
needle
electrodes
inserted
directly
into
the
muscle
are
required.
As stated in Section 3.1, the action potential of a given muscle (or
nerve
fiber)
has
a
fixed magnitude,
regardless of the
intensity of the
stimulus that generates the response. Thus, in a muscle, the intensity with
which the muscle acts does not increase the net height of the action potential
pulse but does increase the rate with which each muscle fiber fires and the
number of fibers that are activated at any given time. The amplitude of the
measured EMG waveform is the instantaneous sum of all the action poten-
tials generated at any given time. Because these action potentials occur in
both positive and negative polarities
at a given pair of electrodes, they

---

## Page 84

^
Sources of Bioelectric Potentials
sometimes add and sometimes cancel. Thus, the EMG waveform appears
very much Uke a random-noise waveform, with the energy of the signal a
function of the amount of muscle activity and electrode placement. Typical
EMG waveforms are shown in Figure 3.9. Methods and instrumentation for
measuring EMG are described in Chapter 10.
Figure 3.9. Typical electromyogram waveform. EMG of
normal "interference pattern" with
full strength muscle
contraction producing obliteration of the baseline. Sweep
speed
is 10 milliseconds per cm; amplitude
is
1 millivolt
per
cm.
(Courtesy
of
the
Veterans
Administration
Hospital, Portland, OR.)
3.3.4.
Other Bioelectric Potentials
In addition to the three most significant bioelectric potentials (ECG, EEG,
and EMG), several other electric signals can be obtained from the body,
although most of them are special variations of EEG, EMG, or nerve-firing
patterns. Some of the more prominent ones are the following:
1. Electroretinogram (ERG):
A record of the complex pattern of
bioelectric potentials obtained from the retina of the eye. This is
usually a response to a visual stimulus.
2. Electro-oculogram (EOG):
A measure of the variations in the
corneal-retinal potential as affected by the position and move-
ment of the eye.
3. Electrogastrogram (EGG):
The EMG patterns associated with
the peristaltic movements of the gastrointestinal tract.

---

## Page 85

A
Electrodes
In observing the measurement of the electrocardiogram (ECG) or the
result of some other form of bioelectric potentials as discussed in Chapter 3,
a conclusion could easily be reached that the measurement electrodes are
simply electrical terminals or contact points from which voltages can be ob-
tained at the surface of the body. Also, the purpose of the electrolyte paste
or jelly often used in such measurements might be assumed to be only the
reduction of skin impedance in order to lower the overall input impedance
of the system. These conclusions, however, are incorrect and do not satisfy
the theory that explains the origin of bioelectric potentials. It must be realized
that the bioelectric potentials generated in the body are ionic potentials,
produced by ionic current flow. Efficient measurement of these ionic poten-
tials requires that they be converted into electronic potentials before they
can be measured by conventional methods. It was the realization of this fact
that led to the development of the modern noise-free,
stable measuring
devices now available.
63

---

## Page 86

64
Electrodes
Devices that convert
ionic potentials
into
electronic potentials are
called electrodes. The theory of electrodes and the principles that govern
their design are inherent in an understanding of the measurement of bioelec-
tric potentials. This same theory also applies to electrodes used in chemical
transducers, such as those used to measure pH, Pq^, and PqOi ^^ the blood.
This chapter deals first with the basic theory of electrodes and then with the
various types used in biomedical instrumentation.
4.1.
ELECTRODE THEORY
The interface of metallic ions in solution with their associated metals
results in an electrical potential that
is called the electrode potential. This
potential is a result of the difference in diffusion rates of ions into and out
of the metal. Equilibrium is produced by the formation of a layer of charge
at the interface. This charge is really a double layer, with the layer nearest
the metal being of one polarity and the layer next to the solution being of
opposite polarity. Nonmetallic materials, such as hydrogen, also have elec-
trode potentials when interfaced with their associated ions in solution. The
electrode potentials of a wide variety of metals and alloys are
listed
in
Table 4.1.
It
is impossible to determine the absolute electrode potential of a
single electrode, for measurement of the potential across the electrode and
its ionic solution would require placing another metaUic interface in the
solution. Therefore all electrode potentials are given as relative values and
must be stated in terms of some reference. By international agreement, the
normal hydrogen
electrode was
chosen
as
the
reference
standard and
arbitrarily assigned an electrode potential of zero volts. All the electrode
potentials listed in Table 4.1 are given with respect to the hydrogen elec-
trode. They represent the potentials that would be obtained across the
stated electrode and a hydrogen electrode if both were placed in a suitable
ionic solution.
Another source of an electrode potential
is the unequal exchange of
ions across a membrane that is semipermeable to a given ion when the mem-
brane separates Hquid solutions with different concentrations of that ion.
An equation relating the potential across the membrane and the two con-
centrations of the ion
is called the Nernst equation and can be stated as
follows:
E =
In
—
nF
C2 fi
where
R =
gas constant (8.315 x
10' ergs/mole/degree Kelvin)
T = absolute temperature, degrees Kelvin

---

## Page 87

4. 1.
Electrode Theory
fg
n = valence of the
ion
(the number
of
electrons added
or
removed to ionize the atom)
F = Faraday constant (96,500 coulombs)
C,,C2 = two concentrations of the ion on
the two
sides of the
membrane
fxyfi =
respective activity coefficients of the ion on the two sides of
the membrane
Unfortunately, the gas constant, R =
8.315 x
10',
is in electromag-
netic cgs units, whereas the Faraday constant, F = 96,500,
is in absolute
coulombs. These units are not compatible. To solve the Nernst equation
in electromagnetic cgs units, F must be divided by 10 (there are 10 abso-
lute coulombs
in each electromagnetic cgs
unit).
This
calculation
gives
Table 4.1. ELECTRODE POTENTIALS"
Electrode Reaction
£o (\olts)
Electrode Reaction
£o (volts)
Li ;±
Li +
-3.045
V
<—
V' +
-0.876
Rb ^
Rb +
-2.925
Zn ^
Zn^ +
-0.762
K
-^
K +
-2.925
Cr ^
Cr^ +
-0.74
Cs
;<±
Cs-i-
-2.923
Ga ^
Ga^ +
-0.53
Ra ^
Ra^ +
-2.92
Fe
4±
Fe^-l-
-0.440
Ba ^
Ba^ +
-2.90
Cd ^
Cd^ +
-0.402
Sr ^
Sr^ +
-2.89
In
"<—
In^-i-
-0.342
Ca ^
Ca^ +
-2.87
TI
*t
T1 +
-0.336
Na ^
Na +
-2.714
Mn
?t
Mn' +
-0.283
La ^
La' +
-2.52
Co ^
Co^ +
-0.277
Mg
:^
Mg^ +
-2.37
Ni ^
Ni^-l-
-0.250
Am
;±
Am^-H
-2.32
Mo
:^
Mo' +
-0.2
Pu ^
Pu' +
-2.07
Ge ^
Ge* +
-0.15
Th ^
Th* +
-1.90
Sn ^
Sn^ +
-0.136
Np ^
Np^ +
-1.86
Pb ^
Pb^ +
-0.126
Be ^
Bc^ +
-1.85
Fe ^
Fe' +
-0.036
u ^
U^ +
-1.80
D, ^
D-l-
-0.0034
Hf ^ HP +
-1.70
H, <^
H +
0.000
Al ^ AP +
-1.66
Cu ^
Cu^ +
+ 0.337
Ti ^
Ti^ +
-1.63
Cu ^
Cu +
+ 0.521
Zr ^
Zr* +
-1.53
Hg
4±
Hg:^ +
+ 0.789
u ^
U* +
-1.50
Ag ^
Ag +
+ 0.799
Np ^
Np* +
-1.354
Rh ^
Rh^ +
+ 0.80
Pu
4±
Pu* +
-1.28
Hg ^
Hg^ +
+ 0.857
Ti ^
Ti» +
-1.21
Pd ^
Pd^ +
+ 0.987
V ^
V^ +
-1.18
Ir ^
Ir^ +
+ 1.000
Mn ^
Mn^-l-
-1.18
Pt
4^
Pt^ +
+ 1.19
Nb ^
Nb^ +
-1.1
Au ^
Au' +
+ 1.50
Cr ^
Cr^ +
-0.913
Au 4±
Au +
+ 1.68
^Reprodueed by permission from Brown,
J. H. V.,
J. E. Jacobs, and L. Stark,
Biomedical Engineering, F. A. Davis Company, Philadelphia, 1971.

---

## Page 88

06
Electrodes
the membrane potential in abvolts, the electromagnetic cgs unit for poten-
tial. However,
1 standard volt equals 10* abvolts; therefore, to convert the
membrane
potential
into
standard
volts,
the
entire
equation must
be
multipHed by a constant lO"'.
The activity coefficients, /, and /z, depend on such factors as the
charges of all ions in the solution and the distance between ions. The prod-
uct, C,/i, of a concentration and its associated activity coefficient is called
the activity of the ion responsible for the electrode potential. From the
Nernst equation it can be seen that the electrode potential across the mem-
brane
is proportional to the logarithm of the ratio of the activities of the
subject ion on the two sides of the membrane. In a very dilute solution the
activity coefficient /approaches unity, and the electrode potential becomes
a function of the logarithm of the ratio of the two concentrations.
In electrodes used for the measurement of bioelectric potentials, the
electrode potential occurs at the interface of a metal and an electrolyte,
whereas
in biochemical transducers both membrane barriers and metal-
electrolyte interfaces are used. The sections that follow describe electrodes
of both types.
4.2.
BIOPOTENTIAL ELECTRODES
A wide variety of electrodes can be used to measure bioelectric events,
but nearly all can be classified as belonging to one of three basic types:
1 . Microelectrodes: Electrodes used to measure bioelectric poten-
tials near or within a single cell.
2. Skin
surface
electrodes: Electrodes
used
to
measure ECG,
EEG, and EMG potentials from the surface of the skin.
3. Needle
electrodes: Electrodes
used
to
penetrate
the
skin
to
record EEG potentials from a local region of the brain or EMG
potentials from a specific group of muscles.
All three types of biopotential electrodes have the metal-electrolyte
interface described in the previous section. In each case, an electrode poten-
tial is developed across the interface, proportional to the exchange of ions
between the metal and the electrolytes of the body. The double layer of
charge at the interface acts as a capacitor. Thus, the equivalent circuit of
biopotential electrode in contact with the body consists of a voltage in series
with a resistance-capacitance network of the type shown in Figure 4-1.
Since measurement of bioelectric potentials requires two electrodes,
the voltage measured
is
really the difference between the instantaneous
potentials of the two electrodes, as shown in Figure 4-2.
If the two elec-
trodes are of the same type, the difference
is usually small and depends

---

## Page 89

ElectrodeO
if
«1
/?2
—^A/v
+ 1. -
\>
Body
electrolytes
Figure 4.1. Equivalent circuit of biopotential electrode interface.
CH
V = £i - £2
»^
AVNr
"body fluids
Figure 4.2. Measurement of biopotentials with two electrodes—equivalent
circuit.
essentially on the actual difference of ionic potential between the two points
of the body from which measurements are being taken. If the two electrodes
are different, however, they may produce a significant dc voltage that can
cause current to flow through both electrodes as well as through the input
circuit of the amplifier to which they are connected. The dc voltage due to
the difference in electrode potentials
is called the electrode offset voltage.
The resulting current is often mistaken for a true physiological event. Even
two electrodes of the same material may produce a small electrode offset
voltage.
In addition to the electrode offset voltage, experiments have shown
that the chemical activity that takes place within an electrode can cause
voltage fluctuations to appear without any physiological input. Such varia-
tions may appear as noise on a bioelectric signal. This noise can be reduced
by proper choice of materials or, in most cases, by special treatment, such
as coating the electrodes by some electrolytic method to improve stability. It
has been found that, electrochemically , the silver-silver chloride electrode is
87

---

## Page 90

Qg
Electrodes
very stable. This type of electrode
is prepared by electrolytically coating
a piece of pure silver with silver chloride. The coating is normally done by
placing a cleaned piece of silver into a bromide-free sodium chloride solu-
tion. A second piece of silver is also placed in the solution, and the two are
connected to a voltage source such that the electrode to be chlorided is made
positive with respect to the other. The silver ions combine with the chloride
ions from the salt to produce neutral silver chloride molecules that coat the
silver electrode. Some variations in the process are used to produce elec-
trodes with specific characteristics.
The resistance-capacitance networks shown
in Figures 4.1 and 4.2
represent the impedance of the electrodes (one of their most important char-
acteristics) as fixed values of resistance and capacitance. Unfortunately, the
impedance is not constant. The impedance is frequency-dependent because
of the effect of the capacitance. Furthermore, both the electrode potential
and the impedance are varied by an effect called polarization.
Polarization is the result of direct current passing through the metal-
electrolyte interface. The effect is much like that of charging a battery with
the polarity of the charge opposing the flow of current that generates the
charge. Some electrodes are designed to avoid or reduce polarization. If the
amplifier to which the electrodes are connected has an extremely high input
impedance, the effect of polarization or any other change in electrode im-
pedance is minimized.
Size and type of electrode are also important in determining the elec-
trode impedance. Larger electrodes tend to have lower impedances. Surface
electrodes generally have impedances of 2 to 10 kn, whereas small needle
electrodes and microelectrodes have much higher impedances. For best results
in reading or recording the potentials measured by the electrodes, the input
impedance of the amplifier must be several times that of the electrodes.
4.2.1.
Microelectrodes
Microelectrodes are electrodes with
tips
sufficiently small to penetrate a
single cell in order to obtain readings from within the cell. The tip must be
small enough to permit penetration without damaging the cell. This action
is usually complicated by the difficulty of accurately positioning an elec-
trode with respect to a cell.
Microelectrodes are generally of two types: metal and micropipet.
Metal microelectrodes are formed by electrolytically etching the tip of a fine
tungsten or stainless-steel wire to the desired size. Then the wire is coated
almost to the tip with an insulating material. Some electrolytic processing
can also be performed on the tip to lower the impedance. The metal-ion
interface takes place where the metal tip contacts the electrolytes either in-
side or outside the cell.

---

## Page 91

4.2.
Biopotential Electrodes
99
The micropipet type of microelectrode is a glass micropipet with the
tip drawn out to the desired size [usually about
1 micron (now more com-
monly called micrometer, \im) in diameter]. The micropipet is filled with an
electrolyte compatible with the cellular fluids. This type of microelectrode
has a dual interface. One interface consists of a metal wire in contact with
the electrolyte solution inside the micropipet, while the other is the interface
between the electrolyte inside the pipet and the fluids inside or immediately
outside the cell.
A commercial type of microelectrode is shown in Figure 4.3. In this
electrode a thin film of precious metal is bonded to the outside of a drawn
glass microelectrode. The manufacturer claims such advantages as lower
impedance than the micropipet electrode, infinite shelf life, repeatable and
reproducible performance, and easy cleaning and maintenance. The metal-
electrolyte interface is between the metal film and the electrolyte of the cell.
Gold plated pin connector
Resin insulation
Metallic thin film
Drawn glass probe
Figure 4.3. Commercial microelectrode with metal film on glass.
(Courtesy
of
Transidyne
General
Corporation, Ann
Arbor,
MI.)
Microelectrodes, because of their small surface areas, have imped-
ances well up into the megohms. For this reason, amplifiers with extremely
high impedances are required to avoid loading the circuit and to minimize
the effects of small changes in interface impedance.
4.2.2. Body Surface Electrodes
Electrodes used to obtain bioelectric potentials from the surface of the body
are found in many sizes and forms. Ahhough any type of surface electrode
can be used to sense EGG, EEG, or EMG potentials, the larger electrodes
are usually associated with EGG, since localization of the measurement is
not important, whereas
smaller
electrodes are used
in EEG and EMG
measurements.
The earliest bioelectric potential measurements used immersion elec-
trodes, which were simply buckets of saline solution into which the subject
placed his hands and feet, one bucket for each extremity. As might be ex-
pected, this type of electrode (Figure 4.4) presented many difficulties, such
as restricted position of the subject and danger of electrolyte spillage.

---

## Page 92

Figure 4.4. ECG measurement using immersion electrodes. Original
Cambridge electrocardiograph (1912) built for Sir Thomas Lewis.
Produced under agreement with Prof. Willem Einthoven, the father
of electrocardiography. (Courtesy of Cambridge Instruments, Inc.,
Cambridge, MA.)
A great improvement over the immersion electrodes were the plate
electrodes,
first introduced about 1917.
Originally, these electrodes were
separated from the subject's skin by cotton or felt pads soaked in a strong
saline solution. Later a conductive jelly or paste (an electrolyte) replaced the
soaked pads and metal was allowed to contact the skin through a thin coat
of jelly. Plate electrodes of this type are
still in use today. An example
is
shown in Figure 4.5.
Figure 4.5. Metal plate electrode.
These plates are usually made of,
or plated with,
silver,
nickel,
or
some similar alloy.

---

## Page 93

Figure 4.6. Suction cup electrode.
Another fairly old type of electrode still in use is the suction-cup elec-
trode shown in Figure 4.6. In this type, only the rim actually contacts the
skin.
One of the difficulties in using plate electrodes
is the possibility of
electrode sUppage or movement. This also occurs with the suction-cup elec-
trode after a sufficient length of time. A number of attempts were made to
overcome this problem, including the use of adhesive backing and a surface
resembling a nutmeg grater that penetrates the skin to lower the contact im-
pedance and reduce the likelihood of shppage.
All the preceding electrodes suffer from a common problem. They are
all sensitive to movement, some to a greater degree than others. Even the
slightest movement changes the thickness of the thin film of electrolyte be-
tween metal and skin and thus causes changes in the electrode potential and
impedance. In many cases, the potential changes are so severe that they
completely
block
the
bioelectric
potentials
the
electrodes
attempt
to
measure. The adhesive tape and **nutmeg grater" electrodes reduce this
movement artifact by limiting electrode movement and reducing interface
impedance, but neither is satisfactorily insensitive to movement.
Later, a new type of electrode, the floating electrode, was introduced
in varying forms by several manufacturers. The principle of this electrode is to
practically eliminate movement artifact by avoiding any direct contact of the
metal with the skin. The only conductive path between metal and skin is the
electrolyte paste or
jelly, which forms an
electrolyte bridge. Even with
the electrode surface held at a right angle with the skin surface, perform-
ance is not impaired as long as the electrolyte bridge maintains contact with
both the skin and the metal. Figure 4.7 shows a cross section of a floating
electrode, and Figure 4.8 shows a commercially available configuration of
the floating electrode.
71

---

## Page 94

Silver-silver chloride
disk
Plastic or rubber support
and spacer
Lead wire
Space for electrode jelly
Figure 4.7. Diagram of floating type skin surface electrode.
Figure
4.8.
Floating
skin
surface
electrode. (Courtesy of Beckman In-
struments, Inc., FuUerton, CA.)
Figure
4.9. Application of
floating
type skin surface electrode. (Courtesy
of
Beckman
Instruments,
Inc.,
FuUerton, CA.)
72

---

## Page 95

Figure 4.10.
Disposable electrodes.
Floating electrodes are generally attached to the skin by means of two-
sided adhesive collars (or rings), which adhere to both the plastic surface of
the electrode and the skin. Figure 4.9 shows an electrode in position for
biopotential measurement.
Special
problems
encountered
in
the monitoring
of
the ECG
of
astronauts during long periods of time, and under conditions of perspira-
tion and considerable movement, led to the development of spray-on elec-
trodes, in which a small spot of conductive adhesive is sprayed or painted
over the skin, which had previously been treated with an electrolyte coating.
Various types of disposable electrodes have been introduced in recent
years to eliminate the requirement for cleaning and care after each use. An
example is shown in Figure 4.10. Primarily intended for ECG monitoring,
these electrodes can also be used for EEC and EMG as well. In general,
disposable electrodes are of the floating type with simple snap connectors
by which
the
leads,
which
are
reusable,
are
attached. Although some
disposable electrodes can be reused several times, their cost is usually low
enough that cleaning for reuse is not warranted. They come pregelled, ready
for immediate use.
Special types of surface electrodes have been developed for other ap-
pUcations.
For example,
a
special
ear-clip
electrode
(Figure
4.11) was
developed for use as a reference electrode for EEG measurements. Scalp
surface electrodes for EEG are usually small disks about 7 mm in diameter
or small solder pellets that are placed on the cleaned scalp, using an elec-
trolyte paste. This type of electrode is shown in Figure 4. 12.
73

---

## Page 96

Figure
4.11.
Ear-clip
electrode.
(Courtesy of Sepulveda Veterans Ad-
ministration Hospital.)
Figure 4.12. EEG scalp surface elec-
trode.
(Courtesy
of
Sepulveda
Veterans Administration Hospital.)
4.2.3.
Needle Electrodes
To reduce
interface impedance and,
consequently, movement
artifacts,
some electroencephalographers use small subdermal needles to penetrate
the scalp for EEG measurements. These needle electrodes, shown in Figure
4.13,
are
not
inserted
into
the
brain;
they merely
penetrate
the
skin.
Generally, they are simply inserted through a small section of the skin just
beneath the surface and parallel to
it.
Figure 4.13. Subdermal needle elec-
trode
for
EEG.
(Courtesy
of
Sepulveda
Veterans
Administration
Hospital.)
74

---

## Page 97

4.2.
Biopotential Electrodes
75
In animal research (and occasionally in man) longer needles are ac-
tually inserted into the brain to obtain localized measurement of potentials
from a
specific part of the brain. This process requires longer needles
precisely located by means of a map or atlas of the brain. Sometimes a
special instrument,
called a stereotaxic instrument,
is used
to hold the
animal's head and guide the placement of electrodes. Often these electrodes
are implanted to permit repeated measurements over an extended period of
time. In this case, a connector is cemented to the animal's skull and the inci-
sion through which the electrodes were implanted is allowed to heal.
In
some
research
applications,
simultaneous
measurement
from
various depths in the brain along a certain axis is required. Special multiple-
depth electrodes have been developed for this purpose. This type of elec-
trode usually consists of a bundle of fine wires, each terminating at a dif-
ferent depth or each having an exposed conductive surface at a specific, but
different, depth. These wires are generally brought out to a connector at the
surface of the scalp and are often cemented to the skull.
Needle electrodes
for EMG- consist merely of fine insulated wires,
placed so that their
tips, which are bare,
are in contact with the nerve,
muscle,
or other
tissue from which the measurement
is made. The
re-
mainder of the wire is covered with some form of insulation to prevent short-
ing. Wire electrodes of copper or platinum are often used for EMG pickup
from specific muscles. The wires are either surgically implanted or introduced
by means of a hypodermic needle that
is later withdrawn, leaving the wire
electrode in place. With this type of electrode, the metal-electrolyte inter-
face takes place between the uninsulated tip of the wire and the electrolytes
of the body, although the wire is dipped into an electrolyte paste before in-
sertion in some cases. The hypodermic needle
is sometimes a part of the
electrode configuration and
is not withdrawn. Instead, the wires forming
the electrodes are carried inside the needle, which creates the hole necessary
for insertion, protects the wires, and acts as a grounded shield. A single wire
inside the needle serves as a unipolar electrodey which measures the poten-
tials at the point of contact with respect to some indifferent reference.
If
two wires are placed inside the needle, the measurement
is called bipolar
and provides a very localized measurement between the two wire tips.
Electrodes for measurement from beneath the skin need not actually
take the form of needles, however. Surgical clips penetrating the skin of a
mouse or rat in the spinal region provide an excellent method of measuring
the ECG of an essentially unrestrained, unanesthetized animal. Conductive
catheters permit the recording of the ECG from within the esophagus or
even from within the chambers of the heart itself.
Needle electrodes and other types of electrodes that create an interface
beneath the surface of the skin seem to be less susceptible to movement arti-

---

## Page 98

76
Electrodes
facts than surface electrodes, particularly those of the older types. By mak-
ing direct contact with the subdermal tissue or the intercellular fluids, these
electrodes also seem to have lower impedances than surface electrodes of
comparable interface area.
4.3.
BIOCHEMICAL TRANSDUCERS
At the beginning of this chapter it was stated that an electrode poten-
tial
is generated either at a metal-electrolyte interface or across a semi-
permeable membrane separating two different concentrations of an ion that
can diffuse through the membrane. Both methods are used in transducers
designed to measure the concentration of an ion or of a certain gas dissolved
in blood or some other liquid. Also, as stated earlier, since it is impossible to
have a single electrode interface to a solution, a second electrode is required
to act as a reference. If both electrodes were to exhibit the same response to
a given change in concentration of the measured solution, the potential
measured between them would not be related to concentration and would,
therefore, be useless as a measurement parameter. The usual method of
measuring concentrations of ions or gases is to use one electrode (sometimes
called the indicator or active electrode) that is sensitive to the substance or
ion being measured and to choose the second, or reference electrode, of a
type that is insensitive to that substance.
4.3.1.
Reference Electrodes
As stated in Section 4.1, the hydrogen gas/hydrogen ion interface has been
designated as the reference interface and was arbitrarily assigned an elec-
trode potential of zero volts. For this reason,
it would seem logical that the
hydrogen electrode should actually be used as the reference in biochemical
measurements. Hydrogen electrodes can be built and are available commer-
cially. These electrodes make use of the principle that an inert metal, such as
platinum,
readily absorbs hydrogen
gas.
If a properly treated piece of
platinum is partially immersed in the solution containing hydrogen ions and
is also exposed to hydrogen gas, which is passed through the electrode, an
electrode
potential
is
formed.
The
electrode
lead
is
attached
to
the
platinum.
Unfortunately,
the hydrogen electrode
is not
sufficiently stable to
serve as a good reference electrode. Furthermore, the problem of maintain-
ing the supply of hydrogen to pass through the electrode during a measure-
ment
limits
its usefulness to a few special appUcations. However,
since
measurement of electrochemical concentrations simply requires a change of
potential proportional to a change in concentration, the electrode potential

---

## Page 99

0.
Figure
4.14. Reference
elec-
trode—basic
configuration.
(Courtesy Beckman
Instruments,
Inc., Fullerton, CA.)
iA
Internal (Ag/Ag CI or calonr^el)
Filling solution
\X
Liquid junction
of the reference electrode can be any amount, as long as it is stable and does
not respond to any possible changes
in the composition of the solution
being measured. Thus, the search for a good reference electrode is essentially
a search for the most stable electrode available. Two types of electrodes
have
interfaces
sufficiently
stable
to
serve
as
reference
electrodes—the
silver-silver chloride electrode and the calomel electrode. Their basic con-
figurations are shown in Figure 4. 14.
The
silver-silver
chloride
electrode
used
as
a
reference
in
elec-
trochemical measurements utilizes the same type of interface described in
Section 4.2 for bioelectric potential electrodes. In the chemical transducer,
the ionic (silver chloride) side of the interface is connected to the solution by
an electrolyte bridge, usually a dilute potassium chloride (KCl) filling solu-
tion which forms a liquid junction with the sample solution. The electrode
can be successfully employed as a reference electrode if the KCl solution is
also saturated with precipitated silver chloride. The electrode potential for
the silver-silver chloride reference electrode depends on the concentration
of the KCl. For example, with a 0.01-mole*-solution, the potential is 0.343
V, whereas for a 1 .0-mole solution the potential is only 0.236 V.
An
equally
popular
reference
electrode
is
the
calomel
electrode.
Calomel
is another name for mercurous chloride, a chemical combination
of mercury and chloride ions. The interface between mercury and mer-
curous chloride generates the electrode potential. By placing the calomel
side of the interface in a potassium chloride (KCl) filling solution, an elec-
A 0.01 -mole solution of a substance is defined as 0.01 mole of the substance dissolved
in
1
liter of solution. A mole
is the quantity of the substance that has a weight equal to
its
molecular weight, usually in grams.
77

---

## Page 100

78
Electrodes
trolytic bridge
is formed to the sample solution from which the measure-
ment
is to be made. Like the silver-silver chloride electrode, the calomel
electrode
is very
stable over long periods of time and serves well as a
reference electrode in many electrochemical measurements. Also, Uke the
silver-silver chloride electrode, the electrode potential of the calomel elec-
trode depends on the concentration of KCl. An electrode with a 0.01-mole
solution of KCl has an electrode potential of 0.388 V, whereas a saturated
KCl solution (about 3.5 moles) has a potential of only 0.247 V.
4.3.2. The pH Electrode
Perhaps the most important indicator of chemical balance in the body is the
pH of the blood and other body fluids. The pH
is directly related to the
hydrogen ion concentration in a fluid. Specifically, it is the logarithm of the
reciprocal of the H
"•" ion concentration. In equation form,
pH =
-log.o[H + ] = log.ojjp-j
The pH
is a measure of the acid-base balance of a fluid. A neutral
solution (neither acid nor base) has a pH of 7. Lower pH numbers indicate
acidity, whereas higher pH values define a basic solution. Most human
body fluids are slightly basic. The pH of normal arterial blood ranges be-
tween 7.38 and 7.42. The pH of venous blood is 7.35, because of the extra
CO2.
Because a thin glass membrane allows passage of only hydrogen ions
in the form of H3O+, a glass electrode provides a
* 'membrane" interface
for hydrogen. The principle
is illustrated in Figure 4.15. Inside the glass
bulb is a highly acidic buffer solution. Measurement of the potential across
the glass interface is achieved by placing a silver-silver chloride electrode in
the solution inside the glass bulb and a calomel or silver-silver chloride
reference electrode in the solution in which the pH is being measured. In the
measurement of pH and, in fact, any electrochemical measurement, each of
the two electrodes required to obtain the measurement is called a half-cell.
The
electrode
potential
for a
half-cell
is sometimes
called
the half-cell
potential. For pH measurement, the glass electrode with the silver-silver
chloride electrode
inside the bulb
is considered one
half-cell,
while the
calomel reference electrode constitutes the other half-cell.
To facilitate the measurement of the pH of a solution, combination
electrodes of the type shown in Figure 4.16 are available, with both the pH
glass electrode and reference electrode in the same enclosure.
The glass electrode
is quite adequate for pH measurements
in the
physiological range (around pH 7), but may produce considerable error at
the extremes of the range (near pH of zero or 13 to 14). Special types of pH

---

## Page 101

To meter
Figure 4.15.
(Left) Glass electrode for pH
measurement.
(Courtesy
Beckman
In-
struments, Inc., FuUerton, CA.)
Figure 4.16.
(Right) Combination electrode
for pH
measurement,
containing
both
a
glass
indicating
electrode and a reference
electrode. (Courtesy Beckman Instruments,
Inc., Fullerton, CA.)
Reference
Ag/AgCI wire contact
pH glass
Buffered solution
Indicating
electrodes are available for the extreme ranges. Glass electrodes are also sub-
ject to some deterioration after prolonged use but can be restored repeatedly
by etching the glass in a 20 percent ammonium bifluoride solution.
The type of glass used for the membrane has much to do with the pH
response of the electrode.
Special hydroscopic glass that readily absorbs
water provides the best pH response.
Modern pH
electrodes have impedances
ranging from
50
to 500
megohms (Mfi). Thus, the input of the meter that measures the potential
difference between the glass electrode and the reference electrode must have
an extremely high input impedance. Most pH meters employ electrometer
inputs.
4.3.3.
Blood Gas Electrodes
Among the more important physiological chemical measurements are the par-
tial
pressures of oxygen and carbon dioxide
in the blood. The
partial
pressure of a dissolved gas
is the contribution of that gas
to the total
pressure of all dissolved gases in the blood. The partial pressure of a gas is
proportional to the quantity of that gas in the blood. The effectiveness of
both the respiratory and cardiovascular systems is reflected in these impor-
tant parameters.
The partial pressure of oxygen, Pq^, often called oxygen tension, can
be measured both in vitro and in vivo. The basic principle is shown in Figure

---
