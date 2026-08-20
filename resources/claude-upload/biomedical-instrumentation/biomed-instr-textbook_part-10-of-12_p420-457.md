# Biomedical Instrumentation Textbook

**Source PDF:** `resources/University books/Biomedical_Instrumentation_Textbook.pdf`
**Chunk:** 10 of 12
**Pages:** 420–457

> Auto-extracted text for Claude Project knowledge. Prefer these Markdown parts over uploading the raw PDF.

---

## Page 420

398
The Computer m Biomedical Instrumentation
There are a number of high-level languages, some suited to specific
types of applications. Among the more important of these are FORTRAN
(an abbreviation of FORmula TRANslation), COBOL (COmmon Business-
Oriented Language), and BASIC (Beginners' All-purpose Instruction Code).
Compilers and/or
interpreters
for
these and many other languages
are
available for most computers, especially the larger ones.
The system software that manages the operation of the computer in-
cludes programs that control the flow of data into and out of the computer
and between primary and secondary memory, and assure that all the neces-
sary operations are carried out as efficiently as possible. These programs
are called by such names as supervisor, monitor, executive, and operating
system.
In a time-sharing system, these programs also control the inter-
action of the computer with the various terminals it services and determine
the priorities with which different functions are handled.
AppUcation software is necessary to adapt a computer to each specific
job it is to do. Some computers involved with medical instrumentation are
used for many purposes and consequently require a variety of application
programs, while others, particularly minicomputers and microcomputers,
are dedicated to one specific task. If the task for which a dedicated computer
is
to
be changed,
a new
set of appHcation
software must
usually be
entered, and often the computer must by physically disconnected from one
set of instrumentation and connected to another.
In many applications,
particularly those related to research, application programs require frequent
modification
or
rewriting.
In
contrast,
dedicated computers
in
clinical
instrumentation systems are often provided with software that remains
unchanged and requires no programming on the part of the user. A computer
system of this kind
is called a turnkey system, since the user must do no
more than turn it on in order to use it.
15.2. MICROPROCESSORS
The
first all-electronic computer (ENIAC, completed in 1945) con-
tained 18,000 vacuum tubes. The poor reUability of such early devices and
the need to shut the computer down to replace defective tubes would have
made much larger computers impractical. The invention of the transistor in
1947 removed this limitation and made possible the development of the first
generation of computers which employed large numbers of (discrete) transis-
tors and semiconductor diodes. In the mid-1950s, semiconductor technology
had developed photolithographic and diffusion methods, which led to the
planar transistor in 1958, followed shortly by the
first integrated circuits
in 1959. Since then the number of circuit components that can be integrated
into a circuit chip has approximately doubled every year. The first step, in
I

---

## Page 421

15.2
Microprocessors
398
which up to about 16 gate functions (64 components) are contained in one
integrated circuit, was called small-scale integration (SSI). SSI circuits range
in complexity up to dual-flip-flops and one-bit binary adders. By about
1965, medium-scale integration (MSI) had evolved, making
it possible to
include up to 200 gate functions (1000 components) on one chip. The more
complex MSI circuits include a complete 4-bit ALU (see Section 15.1.1). By
about 1969 the number of components per circuit exceeded the 1000 limit.
Large-scale integration
(LSI) technology had come into
existence.
Very
large scale integration (VLSI) technologies presently under development
promise even greater concentrations of components on a single chip.
The logical continuation of the development that had begun with placing
an ALU on a chip has now made it possible to put a complete computer cen-
tral processing unit on a chip. The first device of this kind was announced in
1969. Because it was a complete CPU, albeit with somewhat limited perform-
ance, its developers coined the term microprocessor (sometimes abbreviated
MPU or mP). Progress has since continued to the point where the perform-
ance of microprocessors now equals that of the minicomputer CPUs of a
few years ago. The number of components that can be placed on one
integrated-circuit microprocessor
chip has
greatly exceeded
18,000,
the
number of vacuum tubes used by the first, room-sized electronic computer
in 1945.
A computer, however, contains more than just the CPU. Thus,
in
conjunction with microprocessors, large-scale integration has been applied
to the other computer components, such as RAMs and ROMs, introduced
in Section 15.1.1. Output ports for parallel as well as serial interfaces and
controllers for disk drives are also now available as LSI circuit chips.
While the complexity of integrated circuits has increased dramatically
over the years,
their price has actually decreased. As a
result, complete
microcomputers
are now
available which
are comparable
not
only
in
physical size, but also in price, to electronic controllers implemented with
discrete components
or
small-scale-integration
ICs.
Their performance,
however,
is more nearly comparable to rack-size minicomputers, originally
costing several tens of thousands of dollars. These developments have made
it possible to incorporate a microcomputer as an integral part of many elec-
tronic instruments. The designers of biomedical instruments were among
the
first
to
utilize
this
possibility. As a
result,
biomedical
devices have
greatly benefited from this technology.
15.2.1. Types of Microprocessors
The first microprocessor introduced in 1969 was a 4-bit device with a rather
limited instruction set. From this beginning, development evolved in several
directions. Even when utilizing LSI chips for memories and input-output

---

## Page 422

400
The Computer in Biomedical Instrumentation
ports, a complete microcomputer normally includes at least a dozen in-
tegrated circuits in addition to the microprocessor. In a single-chip com-
puter,
all these components have been integrated into one circuit package!
To achieve this feat, however, the size of the program ROM and the data
RAM must be limited. Also, the allowable number of pins in the large IC
packages (usually 40) limits the number of I/O ports.
The 4-bit design as
it was used in the
first microprocessor made
it
necessary to perform mathematical operations one decimal digit at a time.
A word length of 8 bits is more common in modern microprocessors, which
can operate in the (binary-coded) decimal system, two digits at a time, or
with signed or unsigned binary numbers. Because the resolution of an 8-bit
word
is
frequently
insufficient,
multiple-precision
arithmetic may
be
employed. Sixteen-bit microprocessors are also available, some of which are
compatible with the instruction sets of certain minicomputers. Another type
of microprocessor,
called a
bit-slice processor,
requires several chips to
form a complete central processing unit. Each chip, called a bit-slice unit,
contains circuitry for 2 or 4 bits. By combininng chips, words of any desired
length can be used. Because bit-slice microprocessors are available in fast
bipolar Schottky and ECL technologies, the central processing units of all
but the largest mainframe computers can actually be implemented by such
microprocessors. At the other end of the scale is the 1-bit microprocessor,
which is intended to replace digital logic for control applications.
15.2.2.
Microprocessors in Biomedical Instrumentation
The
first biomedical instruments incorporating microprocessors began to
appear on the market around
1975. While the
first devices were mainly
laboratory-type instruments, microprocessors are now used in all areas of
biomedical instrumentation. Although microprocessors were originally ad-
vocated mainly as replacements for controllers using digital logic,
it was
soon found that the new technology could be extended much
further.
Following are some examples of the ways in which microprocessors are
employed in contemporary medical instruments.
15,2.2.1.
Calibration.
Many
instruments
require
zeroing
and
recalibration at certain time intervals, sometimes every few hours. A soft-
ware or hardware timer in a microprocessor system can initiate a calibration
cycle. As with manual cahbration, this cycle requires the introduction of a
blank and standard, each of which might be in the form of a voltage, gas or
liquid.
In
manual
calibration
methods,
zero
and
gain-control
poten-
tiometers
are normally adjusted
until
the readout
indicates
the proper
values. Microprocessor-equipped devices usually perform the caHbration in
digital form. During the calibration, offset and gain correction factors are

---

## Page 423

15. 3
Interfacing the Computer with IVIedical Instrumentation and Other Equipment
401
determined and stored in memory to be applied to the measured data during
the measurement.
15.2.2.2.
Table lookup. In analog systems, nonlinear functions (e.g.,
those required for the correction of a transducer characteristic) are usually
implemented by straight-Hne approximations. In microprocessor-equipped
systems, table lookup with interpolation can be used. This procedure is less
limited and more accurate and also permits the determination of parameters
that are dependent on more than one variable.
15.2.2.3. Averaging.
Microprocessors can easily average data over
time or over
successive measurements and can thus decrease
statistical
variations.
15.2.2.4. Formatting and printout. Because medical equipment using
microprocessors usually processes data in digital form, the microprocessor
can be utilized to format the data, convert the raw data into physical units,
and print out the results in a form that does not require further transcribing
or processing.
15.3.
INTERFACING THE COMPUTER WITH MEDICAL
INSTRUMENTATION AND OTHER EQUIPMENT
To operate effectively with or as part of a medical instrumentation
system, a computer or microprocessor must properly interface with the
various devices comprising the rest of the system. Input data must be re-
quested and received in an acceptable form and output signals must be pro-
vided wherever
control
functions
are
required or where data must be
transmitted to other equipment.
Several important factors must be con-
sidered in interfacing, including the type of output data produced by each
instrument, the logic and formatting requirements of the computer, the input
requirements of any devices that are to receive signals from the computer,
the
method
by
which
these
signals
are
to
be
transmitted,
and
the
commands required to control input-output traffic.
Many biomedical instruments with which a computer may be interfaced
generate analog data in the form of voltages proportional to the variables
represented. For computer entry, these analog signals must be converted in-
to digital form. On the other hand, where the computer is required to pro-
vide analog output signals for display or control purposes, digital output
data must be converted into analog form. Following a discussion of digital
interfacing
requirements,
a
brief
introduction
to
analog-to-digital and
digital-to-analog conversion is presented.

---

## Page 424

402
The Computer in Biomedical Instrumentation
15.3.1.
Digital Interfacing Requirements
Interfacing a computer with other devices that handle data in digital form
involves both software and hardware. The software is usually a part of the
computer's system software and is often an extension of the input-output
package that controls the flow of information to and from such peripheral
devices as disks and magnetic tape drives. Programs are included to monitor
input lines, generate commands, identify the various sources of input data,
accept each word of data as it arrives, and route it to the arithmetic unit or
memory as appropriate.
Interfacing hardware
is required to format the data, provide buffer
registers to temporarily hold each word until it can be dealt with, and where
necessary,
convert input or output
signals from one system of logic to
another.
Formatting is the arranging of data into a form that can be accepted
and recognized by the computer or device receiving computer output. It in-
volves such factors as the number of bits to be received or sent out at a time
and the way in which the bits of a word are arranged among the input or out-
put lines. Data may be received or sent out in either serial or parallel form.
In serial form, the bits of each word or character are received or sent one at
a time over a single line, whereas in parallel transmission, a separate line is
provided for each bit. Serial transmission is generally used where data are
sent
over
long
distances
via
telephone
lines
or
for
connection
to
Teletypewriter keyboard-printers or CRT terminals. On the other hand,
most computer
input-output
(I/O)
ports
accept and
produce
data
in
parallel form, xtoimnng 2i parallel-to-serial ox serial-to-parallel converter . In
such a converter the serial data are shifted into or out of a shift register,
which is parallel-interfaced with the computer I/O port via a buffer register.
A
parallel-to-serial
converter
also
generates and
frames
each word
or
character with start and stop bits which can be recognized by the receiving
device. A serial-to-parallel converter uses these bits to control formatting of
the parallel data.
Where the interface includes more than one digital device, a separate
I/O port can be provided for each, or all the devices can be interconnected
via a common set of data lines called an an input/output data bus or party-
line bus. When this type of bus arrangement is used, additional interconnect-
ing lines must be provided to address each individual device so that data are
transferred to or from only one device at a time and to assure that each
communicating device is properly identified to the computer.
When the digital devices with which the computer must interface can
be controlled so that transfer of data always occurs in time correspondence
with the computer's internal clock, the I/O operation
is said to be syn-
chronous. Most situations, however, require asynchronous input/output in

---

## Page 425

75. 3
Interfacing the Computer with IVIedical Instrumentation and Other Equipment
403
which bidirectional control of the transfer may be accomplished through a
process called handshaking. In this procedure, the computer and the I/O
device exchange signals, indicating first that a valid character is on the line,
ready
to be
received, and then
that
the
transfer has been
successfully
accomplished.
Transmission of data in serial form via a telephone line requires not
only
that
the data be converted
into
serial form and framed with ap-
propriate start and stop bits, but also that the string of bits be placed on a
carrier signal by a modem. The rate of data transmission is given in baud^
the total number of bits transmitted per second, including start and stop
bits. The rate for a 10-character-per-second teletype is 110 baud (a total of
11
bits is required for each 8-bit data character).
Devices with which a computer must interface may produce digital
data
in
pure
binary
form,
binary-coded
decimal,
or
in some
type
of
alphanumeric code, such as ASCII (American Standard Code for Informa-
tion
Interchange)
or EBCDIC (Extended Binary-Coded Decimal
Inter-
change Code). Both of these codes are used extensively in
digital com-
munication. In each code, an 8-bit character
is defined for each numeral,
letter of the alphabet, both upper- and lower-case, and punctuation mark. In
addition, each code contains a number of special characters for control of a
printing device, such as a Teletypewriter, or for identification of the begin-
ning of a block of data. Limited-character 6- and 7-bit ASCII codes are also
available and are used in some applications.
15.3.2.
Analog-to-Digital and Digital-to-Analog
Conversion
Whenever a digital computer must communicate with an instrumentation
system that generates or requires data in analog form, the interface must in-
clude equipment to convert analog signals into digital data or numerical in-
formation in digital form into analog voltages. In the process of digitizing
data, most analog-to-digital (A/D) converters incorporate digital-to-analog
(D/A) conversion circuitry, as indicated below. For this reason D/A con-
verters are discussed
first.
15,3.2,1,
Digital-to-analog conversion.
In
order
to
obtain a con-
tinuous analog signal from a sequence of values in digital form, a voltage
must be generated proportional to the value of each digital word as
it ap-
pears in the sequence. The circuitry by which this is accomplished is called a
digital-to-analog converter.
Generation
of
a
voltage
proportional
to
a
digital word
can
be
accompHshed in various ways. One method
is illustrated in Figure
15.6,
which shows the weighted resistor (summing amplifier) digital-to-analog

---

## Page 426

Figure
15.6. Weighted
resistor type
digital-to-analog
convenor.
(All
switches shown in Binary "1" posi-
tion.)
converter. This circuit is an operational amplifier connected as an analog
adder. The output is the sum of the contributions of the various inputs. At
each input the common input voltage is weighted or multiplied by the ratio
of the feedback resistor to the associated input resistor.
For example, in the circuit shown in Figure 15.6, each bit of a 6-bit
binary word controls the switch to one input. If a given bit has a value of 1
,
its corresponding switch places the appropriate input at a reference voltage
V. If that bit has a value of 0, however, the input is set to ground (0 V). The
most significant bit (labeled A in the figure) then contributes a voltage equal
to V to the output of the circuit when that bit is a
1 , but when that bit has a
value of 0,
it contributes nothing. Because the input resistor for bit B has
twice the value of that for bit A, a
1 in bit B contributes exactly half the
voltage of V to the output.
Similarly,
bit C contributes one-fourth the
voltage of V, and so on down to the least significant bit, F, which, when
given a value of
1, contributes only /32K These contributions correspond
exactly to the relative values of the bits in the binary word. Thus, the output
404

---

## Page 427

15.3
Interfacing the Computer with Medical instrumentation and Other Equipment
405
of the operational amplifier
is proportional to the sum of the value of all
bits that have the value
1, and consequently
is proportional to the value
represented by the digital word. For a binary word of greater length (a
greater number of bits), an additional input resistor and switch are required
for each additional bit. For an n-bii word, the input resistor for the least
significant bit would have a value of 2^^ ~
i R.
Figure 15.7 shows a binary ladder circuit. The output of the ladder cir-
cuit is connected to the input of an operational amplifier. As in the case of
the analog adder, the ladder has an input corresponding to each bit of the
binary word. Again, each input has a switch controlled by the value of its
corresponding bit. As before, when a bit has a value of 1, its input is switched
to ground. The ladder network
is so arranged that each input switched to
voltage V contributes a voltage to the input of the amplifier proportional to
the value of the corresponding binary bit, while the output voltage of the
circuit is proportional to the sum of all bits with a value of
1
. All resistors
are either of value R or 2R. The accuracy of this circuit is not dependent
upon the absolute value of resistors, but upon their relative values. Also,
the ladder is so arranged that, regardless of the combination of switch posi-
tions, the input impedance seen by the amplifier is constant and equal to R.
Figure
15.7.
Binary-ladder
type
digital-to-analog
converter.
(All
switches shown in Binary "1" position.)
Output

---

## Page 428

406
The Computer in Biomedical Instrumentation
In the circuit shown in Figure
15.7, switch A
is controlled by the most
significant bit and switch F is controlled by the least significant bit. To ac-
commodate digital words of greater length, the network can be extended to
provide an input
for each
additional
bit which contributes the
correct
voltage for that bit.
In both types of digital-to-analog converters, the switching is usually
done by soHd-state switching circuits. Although many circuit configurations
of this type are in use, they all essentially accomplish the same purpose of
providing the reference voltage with a digital input of 1 and ground with an
input of 0.
There are several ways of estimating the value of the analog signal at
the output of the converter between the occurrence of digital data points, all
of which
involve analog
filters. The
simplest,
called zero-order
hold,
assumes that the signal remains constant at the level of each digital value
until the next one occurs. Then it jumps immediately to the level of the new
value, where it again remains until another value is received. Unless abrupt
changes in the data can be expected which could result in excessive error,
this method is usually used. More complex (and more expensive) methods
are also available, such 2iS first-order hold, in which the signal at any time is
caused to change at the same rate as it did between the two previous digital
data points.
15.3,2.2. Analog-to-digital conversion. An
analog-to-digital
converter
is a device that accepts a continuous analog voltage signal as input and from
that signal generates a sequence of digital words that represent the analog
voltage as
it varies with time. There are actually two processes involved in
the digitizing of analog data. The first is sampling—the process of measuring
the analog voltage at discrete points in time. The sampled voltage must then
be quantized.
Quantizing
is the selection of a digital word of specified
length to represent the analog voltage.
The simplest form of A/D converter involves a voltage-to-frequency
converter and a counter. The voltage-to-frequency converter produces a
sequence of output pulses at a frequency proportional to the voltage of the
analog signal. The counter counts the number of pulses in a specified unit of
time. The frequency range of the converter and the time period for counting
are selected to provide an output count that corresponds numerically to the
voltage of the analog signal.
Another simple A/D converter
is called a ramp or pulse-width con-
verter. At the beginning of each reading a capacitor is discharged and allowed
to begin charging at a fixed rate,
until
it has reached a voltage equal to
the voltage of the analog signal, as determined by an analog comparator. The
output of the comparator is a pulse whose width is proportional to the analog
voltage. During the duration of the pulse,
a
digital counter counts the

---

## Page 429

15. 3
Interfacing the Computer with Medical Instrumentation and Other Equipment
407
output of a fixed-rate digital clock so that the count at the end of each pulse
is proportional to the analog voltage at that time.
A slightly more complex but inherently more accurate type of A/D
converter is a dual-slope or up-down integrator converter. In this device, the
input of an analog integrator
is alternately switched between the analog
voltage being digitized and a constant reference voltage. As in the pulse-
width converter, a capacitor is charged at a rate proportional to the analog
voltage for a fixed time period, so that the height of the ramp at the end of
the period is proportional to that voltage. The integrator is then switched to
a reference voltage, and the capacitor discharges at a constant rate until the
ramp reaches a predetermined level. The counter counts the clock output
during this discharge interval, which
is proportional to the analog input
voltage.
All three of the A/D converters described so far are relatively inexpen-
sive, but are too slow for any application in which the analog voltage varies
at a rapid rate. Thus, for most A/D converters, faster and more accurate
but also more expensive techniques are employed. In these techniques, the
heart of the A/D converter is a D/A converter of a type described above.
The basic arrangement is shown in block diagram form in Figure 15.8. In
this figure the divider network is a binary ladder which, in conjunction with
the reference supply,
constitutes a D/A converter of the type shown in
Figure 15.7. The flip-flop register is a set of bistable (flip-flop) circuits, each
of which can represent a value of binary
or
1 and can thus store one bit of
a binary digital word. The entire set of flip-flops that constitutes the register
represents each digital word to be generated by the converter. Through the
Figure
15.8.
Analog-to-digital
converter
incorporating
digital-to-
analog converter. (Copyright 1964, Digital Equipment Corporation,
Maynard, MA. All rights reserved.)
Analog input
Comp
Gating
and
control
Digital-to-analog converter
Divider network
Level amplifiers
Ref
supply
- Digital output
Flip-flop register
n
_i

---

## Page 430

406
The Computer in Biomedical Instrumentation
level amplifiers, each flip-flop controls a corresponding input to the ladder
network, and together they produce an analog output with the same voltage
as that represented by the flip-flop register. At the time of sampling, this
voltage is compared with the analog input voltage in an analog comparator
circuit. When these two voltages differ, the bits in the flip-flop register are
adjusted through appropriate gating and control circuitry until agreement is
reached. At that time, the value represented by the flip-flop register is the
nearest digital equivalent to the analog input voltage and is caused to appear
at the output of the converter.
Although nearly all analog-to-digital converters use this comparison
method of matching the value of the register with the input voltage, the
methods by which the digital value of the register is adjusted to match the
input signal can differ widely. The most common method is called the suc-
cessive approximation method,
in which each bit of each digital word
is
successively tested to determine whether
its addition to the value of the
register would cause the input signal to be exceeded. If not, that particular bit
is set to
1
. If the bit would have caused the value of the register to be greater
than the input signal, then the bit
is left at 0. The process begins at the bit
representing the largest value (most significant bit) and continues from **left
to right" down the register. The advantage of this type of system is that the
conversion time is fixed and does not depend on the input signal. Further-
more, this type of converter gives a good response to large, rapid changes in
input, such as might be expected with a multiplexer. To avoid changes in the
input signal during the time the converter is in the process of checking each
bit, a sample-and-hold circuit is often used to read the voltage at the beginning
of each conversion period and to maintain that voltage during conversion
period. The result is a closer approximation of the analog signal.
Important factors in selecting an analog-to-digital converter are the
resolution of the quantizing process, the conversion rate, and the conver-
sion
aperture
time.
Also
to be considered
are
the computer
input
re-
quirements for formatting and the type of logic circuitry that the converter
output must match.
The
quantizing
resolution
of the
converter
is
determined by
the
number of bits in the output word. An 11 -bit-plus-sign word, for example,
is capable of dividing the full range of the input signal into 4095 increments
of
level.
This number
includes 2047
positive increments and a
similar
number of negative increments,
plus zero. The accuracy of any voltage
reading, then, cannot exceed about
1 in 2000, or about 0.05 percent of full
scale. Most physiological data do not require that degree of accuracy,
however, for many transducers cannot provide accuracies much better than
1.0 percent. But since the cost of
1 or 2 additional bits of resolution
is
relatively low,
it usually pays to provide for somewhat greater accuracy
than that actually needed.

---

## Page 431

15.4
Biomedical Computer Applications
409
The conversion rate of an analog-to-digital converter depends on the
conversion method used and the speed of the control circuitry. Extremely
high rates of conversion are available. Shannon's sampling theorem
re-
quires that, to reproduce a periodic signal without severe distortion, the
sampling rate be at least twice the highest frequency component that the
system is able to pass. For nonperiodic waveforms, it is generally good prac-
tice to use a sampling rate of at least five times the highest frequency com-
ponent. Obviously, the higher the sampling rate, the more accurate will be
the representation of the analog signal; but higher digitizing rates mean that
more data must be stored and handled by the computer. This usually results
in a greater computation cost.
The aperture time is the period of time during which the analog signal
is actually being sampled for conversion. A long aperture time might result
in a change of data during the sampling interval. Most modern analog-to-
digital converters have sufficiently short aperture times for the conversion
rates at which they operate.
The process of sequentially taking readings from two or more analog
data
channels
with
a
single
analog-to-digital
converter
is
called
time
multiplexing. UN data channels are multiplexed into a converter which
operates at R conversions per second, and all channels are converted at the
same rate, the conversion rate for any given channel is /?/N conversions per
second. This means that with multiplexing, the conversion rate of the con-
verter must be the required conversion rate for each channel multiplied by
the number of channels. If it is important that all of the channels be con-
verted in exact time correspondence, sample-and-hold circuitry must be in-
corporated into the multiplexer to '*hold'' values until they can be digitized.
15.4.
BIOMEDICAL COMPUTER APPLICATIONS
Applications of the digital computer in medicine and related fields are
so numerous that even listing all of them
is beyond the scope of this text-
book. Most of these applications, however, utilize a few basic capabilities of
the computer which provide an insight to ways in which computers can be
used
in conjunction with biomedical instrumentation. These basic cap-
abilities include:
1
. Data acquisition: The reading of instruments and transcribing
of data can be done automatically under control of the com-
puter.
This not only
results
in a
substantial saving of time
and effort, but also reduces the number of errors in the data.
When data are expected at irregular intervals, the computer can
continuously
scan
all
input
sources and
accept
data when-

---

## Page 432

410
The Computer in Biomedical Instrumentation
ever they are actually produced. If the data originate in analog
form, the computer usually controls the sampling and digitiz-
ing
process
as
well
as
identification and
formatting
of the
data. In some cases, the computer can be programmed to reject
unacceptable readings and provide an indication of possible
trouble in the associated instrumentation. Sometimes the com-
puter provides automatic calibration of each input source.
2. Storage and retrieval: The
ability of the
digital computer to
store and retrieve large quantities of data
is well known. The
biomedical field provides ample opportunities to make use of
this capability.
In a modern hospital,
large amounts of data
are accumulated from many sources. These include admission
and discharge information, physicians' reports, laboratory test
results, and several other kinds of information associated with
each
patient.
In addition,
the hospital also generates a con-
siderable amount of non-patient-oriented data, such as pharm-
acy records, inventories of all types, and accounting records.
Without a computer, the storage of this vast amount of infor-
mation
is both space- and time-consuming. Manual
retrievel
of the data
is
tedious, and
for some types of information,
almost impossible. The
digital computer, however, can serve
as an automated
filing system
in which information can be
automatically
entered
as
it
is
generated.
These
files can be
stored as long as necessary and updated whenever appropriate.
Any or
all of the information can be retrieved on command
whenever desired and can be manipulated to provide output re-
ports in tabular or graphic form to meet the needs of the hospi-
tal staff or other users.
3. Data reduction and transformation: The sequence of numbers
resulting from
digitizing an analog physiological
signal such
as the ECG or EEG would be quite useless
if retrieved from
the computer in raw form. To obtain meaningful information
from such data, some form of data reduction or transformation
is necessary to represent the data as a set of specific parameters.
These parameters can then be analyzed, compared with other
parameters, or otherwise manipulated. For example, the electro-
encephalogram (EEG) signal can be subjected to Fourier trans-
formation to obtain a frequency spectrum of the signal. Fur-
ther analysis can then be performed using the frequency-related
parameters rather than the raw EEG data. The electrocardio-
gram (ECG)
signal can
also be subjected
to data reduction
methods, as shown in section 15.4.1, or heart rate information
can be extracted for patient-monitoring purposes. Special trans-

---

## Page 433

15.4
Biomedical Computer Applications
411
formations are also required to reconstruct images in computer-
ized axial tomography (see Section 15.4.4). The size and com-
plexity of many of these transformation and data reduction
problems are such that manual methods would be completely
impractical.
4. Mathematical operations: Many important physiological vari-
ables cannot be measured directly, but must be calculated from
other variables that are accessible. For example, many of the
respiratory parameters described in Chapter 8 can be calculated
from the results of a few simple breathing tests and gas concen-
tration measurements. Also, the calculation of cardiac output
by a dye or thermal dilution method as described in Chapter 6
can easily be done by computer.
If a digital computer
is con-
nected on-line with the measuring instruments, the calculated
results can often be obtained while the patient is still connected
to the instruments. This not only enables the physician to con-
duct
further
tests
if the
results
so
indicate, but can also
in-
form him immediately if any measurements were not properly
made and require repetition.
5. Pattern recognition: To reduce certain types of physiological
data into useful parameters,
it is often necessary that important
features of a physiological waveform or an image be identified.
For example, analysis of the ECG waveform requires that the
important amplitudes and
intervals of the electrocardiogram
be recognized and
identified.
Digital computer programs are
available to search the data representing the ECG
signal for
certain predetermined characteristics that identify each of the
important peaks. In Section 15.4.1 the technique by which this
is accomplished
is
described. Somewhat
different techniques
are used
in other pattern
recognition problems,
such
as the
identification and
labelling of chromosomes,
but
since each
type of pattern has unique
features
that must be
identified,
programming
for
pattern
recognition
is
a
highly
specialized
process.
6. Limit
detection:
In
applications
involving
monitoring
and
screening,
it
is often necessary to determine when a measured
variable exceeds certain limits. For example, in the analysis of
the electrocardiogram, each important parameter of the ECG
can be checked to determine whether
it falls within a preestab-
Hshed **normar' range. By comparison of the measured para-
meter with each limit of the range, the computer can indicate
which parameters exceed the limit and the amount by which they
deviate from normal. Using
this technique,
patients can be

---

## Page 434

412
The Computer in Biomedical Instrumentation
screened
to
select those with ECG
irregularities
that should
receive further attention.
In most cases, the **normar' range
is
defined
in advance,
but sometimes
the computer
is
pro-
grammed
to
establish normal ranges
for each
patient based
upon the averages of repeated measures taken under specified
conditions.
7.
Statistical analysis of data:
In the diagnosis of disease,
it
is
often necessary to select one most likely cause out of a set of
possible causes associated with a given set of observed symp-
toms, measurements, and
test
results.
Similarly, medical
re-
search investigators must decide at times whether an observed
change or condition in a person or animal is due to some treat-
ment imposed by the researcher, or whether the result could
be
attributed
to some
other cause
or
just
to chance
alone.
Both of these situations require the use of inferential statistical
procedures, some of which
are
quite complex.
Fortunately,
most
statistical
methods
lend
themselves
well
to
computer
techniques,
especially when large numbers of variables must
be analyzed together or where data from a large number of
patients are used. Even simple
descriptive
statistics, such as
means,
standard
deviations, and frequency
distributions can
be computerized,
resulting in significant savings of time and
effort.
8. Data presentation: An important characteristic of any instru-
mentation and data-processing system
is
its ability to present
the results of measurements and analyses to its users in the most
meaningful way
possible.
By
virtue
of
appropriate
output
devices, a digital computer can provide information in a number
of useful forms. Table printouts,
graphs, and charts can be
produced automatically, with features clearly labeled using both
alphabetic and numeric symbols.
If the necessary computer
peripherals are available,
plots and cathode-ray-tube displays
can
also be generated.
In addition to controlling the output
devices,
the computer can
be programmed
to
organize
the
data
for presentation
in the most meaningful form possible,
thus providing the user with a
clear and accurate report of
his results.
9. Control functions:
Digital
computers
are
capable
of
pro-
viding output signals that can be used to control other devices.
In such applications, the computer is programmed to influence
or
control
physiological,
chemical,
or
other
measurements
from which
its input data are being generated. The computer
can also be used to provide feedback to the source of its data.

---

## Page 435

15.4
Biomedical Computer Applications
413
For
example,
while
reading and
analyzing
the
results
of a
chemical process, the computer can be made to control the rate,
quantity, or concentration of reagents added to the process,
or
it could control the heating element of a temperature bath.
By controlling these and other possible inputs, the process can
be regulated to achieve desired results.
In addition, the com-
puter can be programmed to recognize certain characteristics
of the measured
results
that would
indicate possible sources
of error. Sometimes other parameters are monitored in addition
to the actual results to increase the sensitivity of the computer
to conditions that could result in erroneous measurements. The
computer can automatically compensate
for some sources of
error,
such
as
a gradual
drift
in the
baseline, by
either
al-
tering
the
process
itself or by mathematically
adjusting
the
results
before
printing them
out. When more
serious
types
of error
occur,
the computer can
alert
the operator
to
the
condition or,
if necessary, can automatically stop the process.
The extent to which each of the described capabilities above can ac-
tually be utilized in a given situation depends on the available hardware and
software. Obviously, some of these capabilities require greater resources
than others.
Following are some
specific examples of computer apphcations
in
clinical medicine and research. Although they represent only a few of the
many
possible ways
in which computers can be used
in medicine and
biology, they serve to
illustrate the role of each of the above-described
capabilities. In each example, the computer techniques are described in con-
junction with their associated biomedical instrumentation.
1 5.4. 1
. Computer Analysis of the Electrocardiogram
The use of computers
for the
clinical analysis of the electrocardiogram
(ECG) has developed over the span of many years. There are several reasons
for this. First, ECG potentials are relatively easy to measure. Second, the
ECG
is an extremely useful indicator for both screening and diagnosis of
cardiac abnormahties. In addition, certain abnormalities of the ECG are
quite well defined and can be readily identified.
Measurement of the electrocardiogram for computer analysis is essen-
tially the same as is used for manual ECG interpretation. Most computeriz-
ed systems use the 12 standard leads described in Chapter 6. There are more
elaborate systems, however, that simuhaneously measure three orthogonal
components of the ECG vector. For some of these systems, a special or-
thogonal lead configuration is used.

---

## Page 436

414
The Computer in Biomedical Instrumentation
Entry of the ECG into a digital computer requires that the analog
ECG signals be converted into digital form. Although some attempts have
been made to partially reduce the ECG data in analog form, nearly
all
presently used systems incorporate an analog-to-digital converter operating
at a constant rate. The actual sampling rate depends upon the desired band-
width of the signal to be analyzed. Sampling rates ranging from 100 read-
ings per second up to 1000 readings per second are in current use. Analog
filtering
is
often
used ahead
of
the
converter
to
eliminate
noise and
interference above the upper limit of the desired frequency band.
Once inside the computer, the ECG signal can be subjected to addi-
tional smoothing by means of digital
filtering methods. This smoothing
process eliminates high-frequency variations in the signal that might other-
wise be mistaken for features of the ECG.
Pattern recognition techniques are next employed to identify the various
features of the ECG. These features are shown in Figure 3.6. The most
stable reference point of the ECG pattern, and one of the most reliably
identified,
is the downward slope between the R and S waves of the QRS
complex. This slope can be characterized as the most negative peak that
occurs in the first derivative of the ECG waveform. To recognize this point,
the ECG signal must be differentiated to obtain a signal representing the
first derivative, and the first derivative signal must be scanned to locate its
most negative peaks. Other tests are then appUed to both the ECG and its
derivative to verify that a true RS slope has been located.
From this reference point, the computer scans the ECG data in a back-
ward direction with respect to time to locate the positive peak just preceding
the reference. This peak is identified as the R wave. The negative peak of
the ECG just subsequent to the reference slope is the S wave, and the nega-
tive peak just ahead of the R wave is the Q wave.
A predetermined interval of the ECG signal prior to the QRS complex
is scanned for a positive peak to locate the P wave. Actually, the P wave is
often identified on the basis of both the ECG waveform and its first deriva-
tive. The T wave
is identified as a peak within a predetermined interval
of the ECG signal following the QRS complex. In most ECG analysis pro-
grams, identification of the various waves is based on at least two leads.
The baseline of the ECG waveform is usually defined as a straight line
from the onset of the P wave in one ECG cycle to the onset of the P wave in
the next cycle. The amplitude of each of the waves (P, Q, R, S, and T)
is
measured with respect to that baseline. Also, a few points along the S-T
segment are measured to determine their deviation from the baseline. Devia-
tions from the baseline of the ECG signal as well as characteristics of the
first derivative waveform are used to locate the onset and ending times of all
waves. From this information the duration of each wave and the intervals
between waves are measured. The duration of the QRS complex, the P-R
interval, and the S-T interval are especially significant.

---

## Page 437

15.4
Biomedical Computer Applications
415
Each of the measured amplitudes, durations, and intervals is a charac-
teristic parameter of the ECG signal. Another important parameter is the
heart rate (determined by measuring the time intervals between successive
R waves). Each of these parameters can be averaged over several cycles with
the means and standard deviations being printed out for each of the leads
measured.
For screening purposes, each of the parameters can also be checked to
see
if
it
falls within a normal range for that parameter. Any parameters
that he outside the normal range are indicated on the computer-generated
report. A report of this type is shown in Table 15.1. This is the result of a
test run on a 36-year-old male who was presumably normal, but was found
by this screening analysis to have bradycardia (slow heart rate).
identification and other patient information is printed at the top. The
mean values for the various parameters are then presented in a matrix form.
The columns represent the 12 standard leads while the rows indicate the
parameters. Data from lead V3 were purposely omitted to show the response
of the system to missing data. Below this matrix, values for the P-R, QRS,
and Q-T intervals and the heart rate for each of the leads are printed out.
The heart rate varies from lead to lead because in this system each lead is
measured at a different time. Calibration information for each lead and the
calculated angle of the axis of the heart (see Chapter 6) for each portion of
the ECG cycle are also given. At the bottom of the printout are indica-
tions of any noted abnormalities. In the example, the condition of brady-
cardia (heart rate below 60 beats per minute) is noted as well as the absence
of data from one lead.
In more sophisticated systems for computer analysis of the ECG, addi-
tional ways of representing the ECG are derived to further aid in distin-
guishing an abnormal ECG from a normal one. One such representation
is a three-dimensional time-variant vector derived from the simultaneous
measurement of three orthogonal leads. The behavior of this vector
tells
much more about the electrical activity of the heart than does the instan-
taneous calculation of the axis angle for a given portion of the ECG cycle.
Another parameter is the time integral of the ECG waveform. To ob-
tain this integral, the areas of each wave above and below the baseline are
determined and the sum of the areas below the baseline (negative)
is sub-
tracted from the sum of the areas above the baseline (positive). This integral
can be determined for any portion of the ECG cycle. The sum of the time
integral of the QRS complex and that of the T wave
is sometimes called
the ventricular gradienty and is believed to indicate the difference in the time
course of depolarization and repolarization of the ventricles. The time inte-
grals of the three orthogonal leads can be added vectorially to obtain three-
dimensional time integrals.
Some systems for computer analysis of the ECG use statistical methods
in an attempt to classify ECG patterns as various types of abnormalities

---

## Page 438

Table 15.1. ECG COMPUTER ANALYSIS DATA
RUN
H456789A
13:54
1
1 / 5/ 70
U.S.P.H.S. CERTIFIED E.CG.
PROGRAM PROCESSED BY THE BECKMAN HEARTLINF
FOR
BECKMAN
INSTRUMENTS*
INCORPORATED
LOC
10
STAT
PAT
123456789
DATE
11-
5-70
SERIAL
126
OPERATOR
5
36 YR
MALE
5 FT
1
1
IN
190
LBS
BP
NORMAL
MEDS
NONE
I
II
III
AVR
AVL
AVF
VI
V2
V3
V4
V5
V6
PA
.08
.13
.00
-.07
.05
• 08
.05
• 12
.12
.08
• 07
PA
PD
.13
.12
.00
.08
.09
• 10
.05
.10
.10
.11
• 08
PD
Q/SA -.07
.00
.00
-.91
-.11
• 00
.00
.00
.00
• 00
• 00
Q/S<
Q/SD
.02
.00
.00
.06
.02
• 00
.00
.00
.00
• 00
• 00
0/St
RA
.86
.97
.13
.00
• 61
• 58
.16
•41
1.67
1^72
1^33
RA
RD
.05
.09
.05
.00
.05
.09
.02
• 03
• 08
• 10
• 09
RD
SA
-.10
.00
-.21
.00
-.08
.00 -.95- 2^64
• 00
• 00
• 00
SA
SD
.01
.00
.02
.00
.02
.00
.05
• 07
• 00
• 00
• 00
SD
RPA
.00
.00
.07
.00
.00
.00
.00
• 00
• 00
• 00
.00
RPA
RPD
.00
• 00
.02
.00
.00
.00
.00
• 00
• 00
• 00
.00
RPD
STO
.03
.00
.00
-.03
.03
.02
-.03
• 09
• 08
• 01
.00
STO
STM
.03
-.01
-.02
-.01
.04
.02
.04
• 29
• 04
• 01
.00
STW
STE
.04
.00
-.04
-.02
.06
.00
.03
• 38
.08
• 04
.02
STE
TA
.28
.27
.07 -.30
• 24
• 19 -•15
1^15
.61
• 43
• 34
TA
PR
.16
.18
.00
• 21
• 15
.19
.17
• 19
.19
• 18
• 18
PR
QRS
.08
.09
.09
.06
• 09
.09
• 07
• 10
.08
• 10
• 09
QRS
QT
.38
.39
.43
.37
.39
.39
• 38
.39
.39
• 40
• 41
QT
RATE
60
71
61
55
59
58
56
54
62
53
56
RAT
CODE
3
2
2
3
2
2
3
3
A
3
2
2
COD
CAL
99
99
99
99
99
99
99
99
99
99
99
CAl
AXIS
IN
P
QRS
T
Q
R
S
STO
ST-T QRS -T
DEGREES
53
47
28
37 253
23
05 ....:!.J
MSDL APPROVED VERSION
D 41-42-25-1
1
1131
RATE UNDER
60
1
LEAD NOT MEASURED
TIME
1
SECS^
BRADYCARDIA
ATYPICAL ECG
M^D'
416

---

## Page 439

15.4
Biomedical Computer Applications
417
or as being normal. Obviously, the more information available about the
ECG, the better will be the discriminating ability of the computer programs.
Multivariate statistical analysis techniques are sometimes employed, both
for one-dimensional and three-dimensional data. Because of the wide inter-
personal variation even among normals, accurate computer classification is
difficult.
15.4.2 The Digital Computer in the Clinical Chennistry Laboratory
The modern clinical laboratory includes various types of automated instru-
ments for the routine analysis of blood, urine, and other body fluids and
tissues. Some of these devices are described in Chapter 13. While automated
equipment can be used for most laboratory tests, there are still many determi-
nations which are performed manually, either because of insufficient volume
for certain tests or because satisfactory automated tests have not yet been
devised. As a result, data from the clinical laboratory are generated in many
forms, many of which require manual transcription of the test results.
In the chemistry laboratory, Autoanalyzers and other types of auto-
mated clinical chemistry equipment produce charts on which the test results
are recorded. To produce laboratory reports which eventually become a
part of the patients' records, data must be transcribed from these charts
and combined with results from manually performed tests. Care must be
taken to assure that data are accurately transcribed and that each test result
is associated with the correct patient information.
To accommodate the large output of test results from the automated
chnical chemistry equipment and to assimilate those data with patient in-
formation and the results of manually performed tests, a number of chnical
chemistry laboratories have installed computer systems for data acquisition
and processing. Computers of various
sizes including micro processors,
can be used in such systems, depending upon the extent to which the computer
participates
in
the operation of the laboratory.
In a highly automated
system, the computer accepts test requisitions, prepares
lists for blood draw-
ing, schedules the loading of sample trays, reads test results, provides on-
hne quahty control of the process, assimilates data, performs calculations,
prepares reports, and stores data for possible comparison with future test
results.
In a typical computerized system such as those discussed in Section 13.4,
the medical staff may order tests directly via a remote terminal on the hos-
pital ward or by use of machine-readable requisition forms which are auto-
matically read by computer input equipment in the laboratory. From this
requisition information, the computer schedules the drawing of blood by
printing out blood drawing lists and preprinted specimen labels. These labels,

---

## Page 440

418
The Computer in Biomedical Instrumentation
which may be machine-readable, contain identification information to be
used for all tests, automated and manual, from a given patient during that
day. As the specimens arrive in the laboratory, the computer prepares a
loading
list
which
assigns
a
specific
sample
position
in
the
analyzer
loading tray for each test.
Patient information is entered into the computer either at the time the
patient
is admitted to the hospital or when the medical staff orders tests.
This information is usually entered by keyboard, either from a remote term-
inal or in the laboratory.
Once a test run is begun, the output readings of all automated instru-
ments are automatically entered into by the computer. Entry
is usually
accomplished by means of retransmitting slide wires attached to the recorder
pens which produce analog voltages proportional to the output of each
instrument. These analog voltages are sampled and converted to
digital
form by means of a time multiplexer and an analog-to-digital converter.
The computer
is programmed to recognize legitimate peaks as they arrive
and to reject questionable or improperly shaped peaks. The computer also
performs the necessary calculations to convert the value of each measured
peak into medically useful units. By virtue of its position in the sequence of
measured peaks or machine-readable ID labels, each test result is identified
and associated with the correct patient. Control samples, placed randomly
(by computer assignment) throughout the run,
are used to
periodically
check the calibration of the system. By monitoring these control samples
and the measured values from patient samples, the computer is able to per-
form
**on-line quality control.''
In some cases, the computer can auto-
matically correct the output values for drift and certain other types of error.
In case of severe error, the computer may provide a warning to the operator,
who may then choose to stop the test because of equipment malfunction.
The computer, after assimilating data from all automatically performed
tests, may also receive results from manually performed tests. These manual
test results would be entered by keyboard or via machine-readable data sheets
specially prepared for each type of test. Once all test results have been re-
ceived, credibility checks can be run to search for any impossible or un-
likely combinations of results or any impossible changes in a given patient's
test results from one day to the next. After the data have been checked
and verified, the computer provides a physician's report, either in printed
form or on a cathode-ray-tube terminal. This terminal can either be located
in the laboratory, on the patient's ward, or in the physician's office.
In
addition, the computer might incorporate the test results into a patient filing
system, so that whenever desired, the physician can request a profile of test
results for a given patient over a specified number of days. Such a profile
allows the physician to note changes in a patient's condition over time.

---

## Page 441

15.4
Biomedical Computer Applications
4t9
Another feature of most clinical laboratory computer systems
is the
capability of handling emergency requests. Such emergencies often require
that a specimen of blood or urine be entered into the system ahead of
routine samples. When patient identification is controlled by the position of
a sample in the sample tray of the automated instrument, changes in sample
positions to accommodate emergency needs must also be made known to
the computer, either by keyboard notification of each change or by some
automatic means of reading sample cup labels.
Provision must also be made for a physician to obtain results of a
specific test before other tests on that patient have been completed and
prior to the normal reporting of results. The inquiry is usually made by key-
board, either at the computer or from a remote terminal. Results of that
specific test, if available, are given at the same terminal. If the test has not
been completed at the time of the inquiry, the physician is so notified.
15.4.3. The Digital Computer in Patient Monitoring
Instrumentation systems for monitoring patients in intensive- and coronary-
care units are described in Chapter 7. In recent years, especially since the
advent of the microprocessor, an increasing number of patient-monitoring
systems include some form of digital computer.
The type of computer involved and the extent of its role in the overall
patient monitoring system may vary
widely.
In some
systems,
a small
computer, usually a microprocessor,
is used to store a Hmited amount of
data and control a nonfade display of the ECG and other variables in an
analog system. The waveforms either move across the screen with uniform
brightness or remain stationary until replaced by new information, which
appears to sweep across the screen and replace the old trace. Computer-
controlled displays of this type usually include on-screen digital readouts of
such parameters as systolic and diastolic blood pressures and heart rate.
In
another
type
of computerized
patient-monitoring
system,
the
computer
is simply attached to a conventional analog patient monitor to
store and analyze information. Except for the interface through which the
computer receives
its data, the two systems are completely independent.
A computer failure would have no effect whatever on the monitoring of
patients. Waveform and trend plots are displayed on cathode-ray screens
which are separate from the basic patient-monitoring system.
More often, the computer is an integral part of the patient-monitoring
system and, in addition to storing and analyzing data, takes over many of
the functions otherwise performed by analog circuitry, such as the filtering
of signals to remove noise and artifacts and the controUing of alarms in case
of an emergency. Some of the more recent systems utihze microprocessors

---

## Page 442

420
The Computer in Biomedical Instrumentation
for this purpose. The PDS 3000 shown in Figures 7.6 and 7.7 (Chapter 7)
is a system of this type.
In a few very large hospitals, the patient monitoring system is integrated
into a more extensive computer system in which patient records, laboratory
test results, pharmacy records, and related information are combined with
the ongoing data obtained from the patient monitor. Such systems may also
tie in with the operating suite, cardiac catheterization laboratory, and other
special diagnostic laboratories. By bringing together data from many sources,
the computer can provide more complete information to assist the medical
staff in their diagnoses and in monitoring the treatment of patients.
As stated in Chapter 7, the physiological variables typically measured
by a patient-monitoring system include the ECG, temperature, a means of
obtaining respiration rate, and often arterial and central venous blood pres-
sures. Blood gas and pH measurements are also sometimes included. In a
computerized system, the computer generally controls the collection and
logging of data from
their various sources
to assure that readings
are
taken at the required intervals and properly recorded. Even where the com-
puter is merely an adjunct to a conventional analog monitoring system, this
data-acquisition function is required. Since most of the measured variables
occur in analog form, control of an A/D converter is also involved. Digital
filtering techniques are usually employed to smooth the data for display.
Computerized patient-monitoring systems generally involve most of
the basic functions listed and described at the beginning of Section
15.4.
Data acquisition and logging and the basic storage and retrieval functions
have already been discussed. Data reduction and transformation techniques
and mathematical operations are employed extensively in the calculation of
a number of parameters, many of them indirect. The derived parameters
usually include heart
rate,
respiration
rate,
systolic and
diastolic blood
pressures, and mean arterial and venous pressures. Other parameters, such
as cardiac output, stroke volume, blood gas values, urine output, and various
lung volumes and capacities are also sometimes calculated. Pattern-recogni-
tion techniques are utilized in the detection of arrhythmias and combinations
of conditions that may require special attention. Limit detection and statis-
tical analysis are used in checking the validity of data, monitoring for alarm
conditions, and comparing results with normal values. The computer is also
very much involved in the presentation and display of data. In addition to
providing nonfade display of ECG and other raw data, the system may
also produce many forms of graphical display, including histograms, trend
plots, and plots showing the relationship of two or more variables. In some
cases, the computer can also be used to control the infusion of blood or
medication, based on the measured values of affected variables. For example,
it can monitor a patient's urine output and actuate a pump to infuse a
diuretic agent whenever the output falls below a predetermined quantity.

---

## Page 443

15.4
Biomedical Compu terApplica tions
421
15.4.4.
Computerized Axial Tomography (CAT) Scanners
A highly acclaimed application of the digital computer to clinical medicine
is computerized axial tomography (CA T). This procedure, which combines
X-ray imaging (see Chapter 14) with computer techniques, permits visualiza-
tion of internal organs and body structures with greater definition and clarity
than could ever be attained by conventional methods. Although X rays
have been in use since their discovery in 1895 and the reconstruction methods
used in axial tomography date back to 1917, a practical combination of
these techniques could not be achieved until the availability of the modern
computer.
The basic principles involved in conventional X-ray imaging are dis-
cussed in Chapter 14, in which
it is pointed out that the X-ray photograph
is literally a shadow of all organs and structures in the path of the rays. If
two radiopaque objects
lie, one behind the other,
in the X-ray path,
as
shown in Figure 15.9, the smaller of the two may be completely hidden by
the
larger. To
partially
circumvent
this
problem,
a method
of
linear
tomography was developed in which the X-ray source and film are simultan-
eously moved in opposite directions,
as shown in Figure
15.10. For any
given combination of source and film velocities, there will be one single
plane perpendicular to the path of the rays in which objects will appear to
remain stationary with respect to the film during the movement. In con-
trast, the shadows of objects at
all other distances from the source will
move on the film and produce a blur. In Figure 15.10, the sphere lies in
the plane that appears stationary, whereas the cube does not. The shadow
of the sphere is therefore reinforced as the X-ray vantage point is changed.
The principle of obtaining X-ray images from a number of vantage
points
is also used in computerized axial tomography, but in a different way.
As the name implies, the vantage points for axial tomography are taken
around the axis of the body. Instead of sending X rays through the entire
portion of the body to be visualized, a very narrow pencil-Uke X-ray beam
scans a single
slice perpendicular to the body's axis. By scanning two or
more such slices, a three-dimensional representation can be produced. Rather
than obtaining an image on an X-ray
film, the intensity of the X rays,
after penetrating the body,
is measured by means of one or more sodium
iodide, xenon, or calcium chloride crystal detectors, which
scintillate in
proportion to the intensity (see Chapter 14). The scintillation light is measured
by photomultiplier tubes. In the original computerized axial tomography
(CAT) scanners, the source of the pencil-like beam was mechanically moved
across the region of the slice, as shown in Figure 15.11. At the same time,
the detector moved linearly in parallel with the source to receive a signal
whose variations with respect to time represented the density pattern across
the slice from one vantage point. The mechanism containing the source and

---

## Page 444

Figure 15.9. Conventional X-ray imaging of two
objects, one behind the other.
X-ray source
Figure 15.10. Linear tomography. X-ray source
and film move simultaneously in opposite direc-
tions. Plane,
in which small sphere
lies, appears
stationary on film.
X-ray source
detector were then rotated about the axis of the body to a new vantage point,
from which another scan of the slice was made. Scans were taken from 180
such vantage points,
1 ° apart. Data from each scan were fed into a computer,
which combined the density pattern and reconstructed the anatomical density
of the two-dimensional
slice. By repeating this process for several
slices,
a detailed three-dimensional representation could be obtained. The early
instruments usually scanned two
slices
at a time,
this process requiring
about 5 minutes. Because the region to be scanned had to remain stationary
for
this length of time, such scans were limited to the brain and other
structures of the head, which could be kept immobilized in the necessary
position by water bags.
422

---

## Page 445

X-ray source
Cross-section
of body
Detector
Figure
15.11. Scanning
pattern
of
early
computerized
axial
tomography (CAT) scanners. X-ray source and detector move simul-
taneously in linear parallel paths to measure density through
slice.
Entire unit rotates about body to obtain scans from 180 vantage
points,
1 ° apart.
Detectors
Figure 15.12 Fan beam covering entire cross-section of body with
large array of detectors. EHmination of need for linear motion of
source and detectors reduces scanning time.
423

---

## Page 446

424
The Computer in Biomedical Instrumentation
To reduce scanning time, modern CAT scanners use X-ray sources
that produce fan beams and multiple detectors to simultaneously measure
the density across a wider portion of the sUce. The fastest instruments have
a fan beam that covers the entire width of the slice, as shown in Figure 15.12.
Several hundred detectors are required to measure the density pattern of the
slice with
sufficient resolution to meet cUnical needs.
Greater scanning
speed
is also obtained by taking scans from fewer vantage points around
the body. One commercial system,
for example, uses only
15 scans,
12°
apart; another uses 18 scans, 10° apart. Using these techniques, the time
for complete scanning of a sHce has been reduced to as little as IVi seconds.
Scanners with
lOO-msec scan times
are under development. A modern
instrument of this type is shown in Figure 15.13. Some instruments offer a
choice of two scanning
rates, permitting a trade-off between speed and
resolution.
The higher scanning rates now available permit scanning of all sections
of the body, since a patient can be asked to hold his or her breath and lie
completely still for the few seconds necessary to complete a procedure. By
synchronizing scans with the ECG,
it
is even possible to reconstruct slices
of the heart in various phases of the cardiac cycle.
Figure 15.13. Modern computerized axial tomography (CAT) scanner
(Courtesy of EMI Medical Inc., Northbrook, IL.)

---

## Page 447

Figure 15.14. Reconstructed image of slice through brain, (a) Non-
contrast CT scan of the mid-brain demonstrating the third ventricle,
frontal horns of the lateral ventricles, and quadrageminal cistern, (b)
Quadrant magnification of scan in
(a). (Courtesy of EMI Medical
Inc., Northbrook, IL.)

---

## Page 448

426
The Computer in Biomedical Instrumentation
In the computer the cross section to be reconstructed
is divided into
tiny picture elements called pixels. The greater the number of pixels, the
greater the resolution. An image of 180 x
180, or a total of 32,400 pixels,
is typical. Each pixel is given a value proportional to the X-ray density of
that element.
Several different mathematical techniques can be used to construct an
image from the set of density patterns obtained during the individual scans.
Most involve Fourier transformations and some require iterative operations,
both of which are well suited to computer techniques. Digital spatial filters
are usually employed to remove the blurring effects of the shadows created
by more dense regions.
In the
final
result, each pixel of the computer-
generated image
is given a degree of brightness proportional to
its X-ray
density. Figure 15.14 is an example of a reconstructed image of a slice through
the brain. Figure 15.15 shows an image of the abdominal region. In some
systems, the contrast between regions of different density can be enhanced
by assigning each level of brightness a different color on a color TV monitor.
This process, called color enhancement, provides a further aid in the detec-
tion of tumors and other abnormalities that might go unnoticed in a black-
and-white display.
Because the CAT scanner can provide information about
internal
organs and body structures unobtainable by any other available means,
and with radiation exposure to the patient no greater than that of conventional
X-ray photographs, this instrument brought about a revolution in diagnostic
radiology.
Its popularity has resulted in scanners being installed in numerous
hospitals throughout the United States, Europe, and many other parts of
the world. The number of these installations and their high cost (ranging
from $250,000 to nearly $1,000,000) have drawn criticism from those who
fear technology as a contributor to increasing medical costs. Attempts to
regulate the number of scanners on the basis of population have received
considerable support. Nonetheless,
this instrument
is widely regarded as
one of the major developments in medical instrumentation in recent years.
15.4.5.
Other Computer Applications
The examples discussed
in the previous
sections represent only a small
sample of the many ways in which computers are used in medical instrumen-
tation. Although the proliferation of computers and microprocessors has
extended into almost
all types of medical instrumentation, a few more
specific appUcations should be mentioned.
In the pulmonary function laboratory, pulmonary function tests and
arterial blood gas
analysis are often computerized. Measured values of
lung volumes, vital capacity, flow rates, FEVs, blood gas levels, and related
variables are compared with predicted normal values, based on the height.

---

## Page 449

Figure 15.15.
Reconstructed image of abdominal slice,
(a) CT scan at
the mid-renal
level; Normal study; Contrast
filled renal pelvis
is well
demonstrated; The infundibula are clearly visualized
bilaterally. The
vena-cava and aorta are also visible, (b) CT scan of the same patient at a
slightly higher level; Shows the lower aspect of the gall bladder and tip
of the spleen; Both kidneys are well demonstrated with contrast noted in
the collecting system; The left renal vein can be seen in its entirety exten-
ding anterior to the aorta and entering the inferior vena-cava. (Cour-
tesy of EMI Medical Inc., Northbrook, IL.)

---

## Page 450

428
The Computer in Biomedical Instrumentation
weight, and age of the patient. Variables not directly measurable are cal-
culated and results may be interpreted for the physician. In some systems,
each set of measurements
is compared with data from previous analyses
for determination of trends.
An extension of computerized ECG analysis are various computer-
assisted systems for exercise. In such systems preliminary data are gathered
to establish a preexercise cardiac template and to search for any contra-
indications to exercise for the patient. During the exercise, the ECG is moni-
tored to determine the changes in a number of specific features of the wave-
form and to detect various exercise end-point indicators, such as attainment
of a target heart rate, supraventricular tachycardia, a predetermined amount
of S-T depression, and certain PVC patterns.
The cardiac catheterization laboratory provides another area in which
the computer is able to make a significant contribution. Intracardiac blood
pressures and pressure gradients across heart valves,
vascular resistance
values, and other parameters of importance to the physician in locating and
defining cardiovascular abnormalities are measured or calculated using data
from one or more catheters within the chambers of the heart. With an
on-Une computer, results can be obtained almost immediately, giving the
physician the assurance that the catheter is in the desired location and often
eliminating the need for the patient to return for a repeat of the test.
The success of computerized axial tomography to obtain detailed X-ray
images of slices of the body (Section 15.4.4) has led to the development
of similar techniques for other forms of imaging. A promising example is
emission
computerized
tomography,
an
application
of
computerized
tomographic techniques to nuclear medicine, which permits detailed visu-
alization of the distribution of radioisotopes throughout the body. As ex-
plained in Chapter 14, radioactive isotopes of certain elements can be used
to trace the metabolism, pathways, and concentrations of these elements.
Through emission computerized tomography, the physician can be provided
a detailed three-dimensional distribution map of an isotope which has been
injected into the body and allowed to distribute itself. The three-dimensional
image
is created by taking a number of slice scans, similar to the X-ray
slice images obtained by CAT scanner. The instrumentation for emission
computerized tomography is more complicated, however. In one configu-
ration the body or section of the body to be imaged
is surrounded by 66
sodium iodide detectors,
1 1 on each side of a hexagonal array. The detectors
are scanned sequentially and coincident pulses on opposite
sides of the
hexagon are detected and counted. The entire array is rotated through 60°
during the course of a normal scan. The count of coincident events for each
pair of detectors is fed into a computer which, using techniques similar to
those employed in CAT scanners, produces a radioactivity map of each shce
scanned.

---

## Page 451

15. 4
Biomedical Computer Applications
429
Computerized tomographic methods are being developed for ultrasonic
imaging of the heart and abdominal organs. Computer techniques are also
involved in zeugmatography, a new noninvasive imaging method utilizing
the measurement of nuclear magnetic resonance (NMR). The benefits to be
obtained from these and other new computer applications in medical tech-
nology must yet be assessed in light of their costs before their clinical signifi-
cance can be determined.

---

## Page 452

Electrical Safety
of
Medical Equipment
Each year in the United States about 100,000 people are
killed
in
accidents. About half the fatal accidents occur in motor vehicles, about
20 percent involve falls, and only about
1 percent of the fatalities are caused
by electric current, including lightning. The majority of accidental electro-
cutions occur in industry or on farms. The statistics, which consider medical
facilities to be industries, do not specifically show how many of these acci-
dents occur in hospitals, but the number is probably not large. Most electrical
accidents, however, are not fatal, but incidents in which staff members or
patients receive nonfatal electrical shocks are much more common than the
fatality statistics show.
Over the years electrical and electronic equipment has found increasing
use in the hospital.
Little attention was paid at
first to the hazards that
this proliferation might create. Some sensational reports published around
1970 on microshock hazard, which supposedly had killed a large number of
patients
in intensive-care units, suddenly drew attention to this subject.
While the reports on microshock accidents were frequently anecdotal and
no concise statistical analysis ever seems to have been published, growing
430

---

## Page 453

16. 1
Physiological Effects of Electrical Current
431
concern about electrical hazards nevertheless resulted in numerous regula-
tions and standards which attempted to improve electrical safety in the
hospital. While some of the requirements have come under attack
for
unnecessarily
increasing
the
cost of health
care,
this development
has
definitely contributed to improved design of electrical and electronic equip-
ment for hospital use.
16.1
PHYSIOLOGICAL EFFECTS
OF ELECTRICAL CURRENT
Electrical accidents are caused by the interaction of electric current
with the tissues of the body. For an accident to occur, current of sufficient
magnitude must flow through the body of the victim in such a way that
it
impairs the functioning of vital organs. Three conditions have to be met
simultaneously [see Figure 16.1(a)]: two contacts must be provided to the
body (arbitrarily called first and second contacts), together with a voltage
source to drive current through these contacts. The physiological effects of
the current depend not only on their magnitude but also on the current
pathway through the body, which in turn depends on the location of the
2.)
Second
contact
Figure 16.1. The electrical accident.
(a) The
three
necessary
conditions.
(b) The generalized model where Rp
is
the
fault
or
leakage
resistance,
Rci and Rc2
are
first and
second
contact resistance, Rg
is body resist-
ance and Rr
is
the ground
return
resistance.
1.)
First
contact
(a)
Line
voltage
I ('V
Current
(b)

---

## Page 454

432
Electrical Safety of Medical Equipment
first and second contacts. Two particular situations have to be considered
separately: when both contacts are applied to the surface of the body and
when one contact is applied directly to the heart. Because the current sen-
sitivity of the heart is much higher in the second case, the effect of current
applied directly to the heart
is often referred to
as microshock,
while in
this context the effect of current appUed through surface contacts is called
macroshock.
Figure 16.1(b) is a generalized model of an electrical accident and will
be referred to later in the chapter in various appropriate sections.
Basically, electric current can affect the tissue in two different ways.*
First, the electrical energy dissipated in the tissue resistance can cause a
temperature
increase.
If a high enough temperature
is
reached,
tissue
damage (burns) can occur. With household current,
electrical burns are
usually limited to localized damage at or near the contact points, where the
density of the current is the greatest. In industrial accidents with high voltage,
as well as
in lightning accidents, the dissipated
electrical energy can be
sufficient to cause bums involving larger parts of the body. In electrosurgery,
the concentrated current from a radio-frequency generator with a frequency
of 2.5 or 4 MHz is used to cut tissue or coagulate small blood vessels.
Second, as shown in Chapter 10, the transmission of im^pulses through
sensory and motor nerves involves electrochemical action potentials. An
extraneous electric current of sufficient magnitude can cause local voltages
that can trigger action potentials and stimulate nerves. When sensory nerves
are stimulated
in
this way,
the
electric current causes a
**tingling"
or
** prickling" sensation, which at sufficient intensity becomes unpleasant and
even painful. The stimulation of motor nerves or muscles causes the con-
traction of muscle fibers in the muscles or muscle groups affected. A high-
enough intensity of the stimulation can cause tetanus of the muscle,
in
which all possible fibers are contracted, and the maximal possible muscle
force is exerted.
The extent of the stimulation of a certain nerve or muscle depends
on the potential difference across its cells and the local density of the current
flowing through the tissue. An electric current flowing through the body
can be hazardous or fatal if it causes local current densities in vital organs
that are
sufficient to interfere with the functioning of the organs. The
degree to which any given organ is affected depends on the magnitude of the
current and the location of the electrical contact points on the body with
respect to the organ.
Respiratory paralysis can also occur if the muscles of the thorax are
tetanized by an electric current flowing through the chest or through the
*A third type of injury can sometimes be observed under skin electrodes through which
a small dc current has been flowing for an extended time interval. These injuries are due to
electrolytic decomposition of perspiration into corrosive substances and are, therefore, actual
chemical burns.

---

## Page 455

I
16. 1
Physiological Effects of Electrical Current
433
respiratory control center of the brain. Such a current is likely to affect the
heart also, because of its location.
The organ most susceptible to electric current is the heart. The peculiar
characteristics of its muscle fibers cause
it to react to electric current dif-
ferently than other muscles. When the current density within the heart
exceeds a certain value, extra systolic contractions first occur. If the current
density is increased further, the heart activity stops completely but resumes
if the current
is removed
within a
short
time.
This type of response,
however, appears to be limited to a fairly narrow range of current density.
An even further increase in current density causes the heart muscle to go
into fibrillation. In this state the muscle fibers contract independently and
without synchronism, a situation that fails to provide the necessary gross
contraction. When
the
fibrillation
occurs
in
the
ventricles
(ventricular
fibrillation) the heart is unable to pump blood. In human beings (and other
large mammals) ventricular fibrillation does not normally revert spontaneously
to a normal heart rhythm. Ventricular fibrillation and resulting cessation
of blood circulation is the cause of death in the majority of fatal electrical
accidents.
It can be converted to a regular heart rhythm, however, by the
application of a defibrillating current pulse of sufficient magnitude. Such
a pulse, applied from a defibrillator (see Section 7.6), causes a momentary
contraction of many or
all muscle
fibers of the heart, which
effects a
synchronization of their activity.
If,
in an accidental situation, the heart
receives enough current to tetanize the entire myocardium and assuming the
current
is removed in time, the heart will revert to normal rhythm after
cessation of the current.
The magnitude of
electric
current
required
to produce
a
certain
physiological effect in a person is influenced by many factors. Figure 16.2
shows the approximate current ranges and the resuhing effects for
1 -second
exposures to various levels of 60-Hz alternating current applied externally
to the body. For those physiological effects that involve the heart or respira-
tion, it is assumed that the current is introduced into the body by electrical
contact with the extremities in such a way that the current path includes the
chest region (arm-to-arm or arm-to-diagonal leg).
For most people, the perception threshold of the skin for light finger
contact
is approximately 500 /i A, although much lower current intensities
can be detected with the tongue. With a firm grasp of the hand, the threshold
is about
1 mA. A current with an intensity not exceeding 5 mA is generally
not considered harmful, although the sensation at this level can be rather
unpleasant and painful. When at least one of the contacts with the source
of electricity
is made by grasping an electrical conductor with the hand,
currents in excess of about
10 or 20 mA can tetanize the arm muscles
and make it impossible to **let go" of the conductor. The maximum current
level a person can tolerate and
still voluntarily let go of the conductor
is
called his let-go current level.
Ventricular fibrillation can occur at currents

---

## Page 456

10A
1 A-
100 mA
10 mA
1 mA
500 mA
SEVERE BURNS
and physical injury
Sustained myocardial
contraction (followed
by normal heart
rhythm if current
is removed in, time)
DANGER
of ventricular
fibrillation
Pain, fatigue, possible
physical injury
V Danger of
respiratory paralysis
Maximum "let go" current
Accepted safe level (5 mA)
' Threshold of perception
Figure 16.2.
Physiological effects of electrical current from
1 -second external contact with the body (60 Hz ac).
434

---

## Page 457

16. 1
Physiological Effects of Electrical Current
435
above about 75 mA, while currents in excess of about
1 or 2 A can cause
contraction of the heart, which may revert to normal rhythm if current is
discontinued in time. This condition may also be accompanied by respira-
tory paralysis.
Data on these effects are rare for obvious reasons and are generally
limited to accidents in which the magnitude of the current could be recon-
structed, or to experimentation with animals. From the data available
it
appears that the current required to cause ventricular fibrillation increases
with the body weight and that a higher current
is required
if the current
is applied for a very short duration. From experiments in the current range
of the perception threshold and let-go current,
it is known that the effects
of the current are almost independent of frequency up to about 1000 Hz.
Above that
limit, the current must be increased proportionally with the
frequency in order to have the same
effect.
It can be assumed that,
at
higher current levels, a similar relationship exists between current effects
and frequency.
In
the
foregoing
considerations,
the
electrical
intensity
is
always
described in terms of electric current. The voltage required to cause the
current flow depends solely on the electrical resistance that the body offers
to the current. This resistance is affected by numerous factors and can vary
from a few ohms to several megohms. The largest part of the body resistance
is normally represented by the resistance of the skin. The inverse of this
resistance, the skin conductance,
is proportional to the contact area and
also depends on the condition of the skin. Intact, dry skin has a conductivity
of as low as 2.5
/i
i; cm^ This low conductivity
is caused mainly by the
horny, outermost layer of the skin, the epithelium, which provides a natural
protection against electrical danger. When this layer is permeated by a con-
ductive fluid, however, the skin conductivity can increase by two orders of
magnitude.
If the skin
is
cut,
or
if conductive objects Uke hypodermic
needles are introduced through the skin, the skin resistance
is effectively
bypassed. When this situation occurs, the resistance measured between the
contacts is determined only by the tissue in the current path, which can be as
low as 500 ^2
.
Electrode paste used
in the measurement of bioelectric
potentials (see Chapters 4,
6, and
10) reduces the skin resistivity by elec-
trolyte action and mechanical abrasion. Many medical procedures require
the introduction of conductive objects into the body, either through natural
openings or through incisions in the skin. In many instances, therefore, the
hospital
patient
is deprived of the
natural
protection
against
electrical
dangers that the skin normally provides. Because of the resulting low resis-
tance, dangerously high currents can be caused by voltages of a magnitude
that normally would be rendered safe by the high skin resistance.

---
