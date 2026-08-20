# Biomedical Device Technology: Principles and Design

**Author:** Anthony Y. K. Chan, Ph.D., P.Eng., CCE
**Edition:** Third Edition (excerpt from source PDF)
**Publisher:** Charles C Thomas
**Source file:** `resources/University books/Biomedical_Device_Technology_Chan_excerpt.pdf`
**Pages in this file:** 17

> Note: Extracted from a 17-page PDF. If you intended the full textbook, replace the PDF and re-run extraction — Claude only sees pages present here.

---

## Page 1

BIOMEDICAL DEVICE TECHNOLOGY

---

## Page 2

ABOUT THE AUTHOR

Anthony Y. K. Chan graduated in Electrical Engineering (B.Sc.
Hon.) from the University of Hong Kong and completed his M.Sc. in
Engineering from the same university. He also completed a master’s
degree (M.Eng.) in Clinical Engineering and a Ph.D. in Biomedical
Engineering from the University of British Columbia, Canada. Dr.
Chan also holds a Certificate in Health Services Management from
the Canadian Healthcare Association. Dr. Chan worked for a number
of years as a project engineer in the field of electrical instrumenta-
tions, control, and systems, and was the director and manager of bio-
medical engineering in a number of Canadian acute care hospitals.
He is currently the Program Head of the Biomedical Engineering
Technology Program at the British Columbia Institute of Technology
and is an Adjunct Professor of the School of Biomedical Engineering
at the University of British Columbia. Dr. Chan is a Professional
Engineer, a Chartered Engineer, and a Certified Clinical Engineer. He
is a fellow member of CMBES, life senior member of IEEE, member
of IET and HKIE.

---

## Page 3

CHNOLOG
EDIC
Third Edition
CAL DEVICE
GY
inciples and Design
By
., P
. K. CHAN
Y.
N, PH.D P.ENG., CCE
H O M A S • P U B L I S H E R • L T D .




BIOMEDIC
TECHNOLOG
Principles and Design
ANTHONY Y





S
C H A R L E S C T H O M A S
 P U B L I S H E R
 L T D .
S



  

  

---

## Page 4

Published and Distributed Throughout the World by

CHARLES C THOMAS • PUBLISHER, LTD.
2600 South First Street
Springfield, Illinois 62704


This book is protected by copyright. No part of
it may be reproduced in any manner without written
permission from the publisher. All rights reserved.


© 2023 by CHARLES C THOMAS • PUBLISHER, LTD.

ISBN 978-0-398-09392-1 (hard)
ISBN 978-0-398-09393-8 (ebook)

First Edition, 2008
Second Edition, 2016
Third Edition, 2023

                    Library of Congress Catalog Card Number: 2022036373 (print)
                                                                       2022036374 (ebook)

With THOMAS BOOKS careful attention is given to all details of manufacturing
and design. It is the Publisher’s desire to present books that are satisfactory as to their
physical qualities and artistic possibilities and appropriate for their particular use.
THOMAS BOOKS will be true to those laws of quality that assure a good name
and good will.


Printed in the United States of America
CM-C-1

Library of Congress Cataloging-in-Publication Data

Names: Chan, Anthony Y. K., author.
Title: Biomedical device technology: principles and design / by Anthony
Y.K. Chan.
Description: Third edition. | Springfield, Illinois: Charles C Thomas,
Publisher, Ltd., 2023. | Includes bibliographical references and index.
Identifiers: LCCN 2022036373 (print) | LCCN 2022036374 (ebook) | ISBN
9780398093921 (hardback) | ISBN 9780398093938 (ebook)
Subjects: MESH: Biomedical Technology--instrumentation | Equipment and
Supplies | Equipment Design | Equipment Safety
Classification: LCC R855.3 (print) | LCC R855.3 (ebook) | NLM W 26 | DDC
610.285--dc23/eng/20221103
LC record available at https://lccn.loc.gov/2022036373
LC ebook record available at https://lccn.loc.gov/2022036374

---

## Page 5

This book is dedicated with love to
my wife Elaine,
my daughters Victoria and Tiffany,
and
in memory of
my brother David

---

## Page 6

*(No extractable text on this page)*

---

## Page 7

PREFACE


F
or many years, the tools available to physicians were limited to a few
simple handpieces such as stethoscopes, thermometers and syringes;
medical professionals primarily relied on their senses and skills to perform
diagnosis and disease mitigation. Today, diagnosis of medical problems is
heavily dependent on the analysis of information made available by sophis-
ticated medical machineries such as electrocardiographs, video endoscopic
equipment and pulmonary analyzers. Patient treatments often involve spe-
cialized tools and systems such as cardiac pacemakers, electrosurgical units,
and minimally invasive surgical instruments. Such biomedical devices play
a critical and indispensable role in modern-day medicine.
In order to design, build, maintain, and effectively deploy medical
devices, one needs to understand not only their use, design and construction
but also how they interact with the human body. This book provides a com-
prehensive approach to studying biomedical devices and their applications.
It is written for engineers and technologists who are interested in under-
standing the principles, design, and use of medical device technology. The
book is also intended to be a textbook or reference for biomedical device
technology courses in universities and colleges.
The most common reason for medical device obsolescence is changes in
technology. For example, vacuum tubes in the 1960s, discrete semiconduc-
tors in the 1970s, integrated circuits in the 1980s, microprocessors in the
1990s and networked multiprocessor software-driven systems in today’s
devices. The average life span of medical devices has been diminishing; cur-
rent medical devices have a life span of about 5 to 7 years. Some are even
shorter. Therefore, it is unrealistic to write a book on medical devices and
expect that the technology described will remain current and valid for years.
On the other hand, the principles of medical device and their applications,
the origins of physiological signals and their methods of acquisitions, and the
concepts of signal analysis and processing will remain largely unchanged.
This book focuses on the applications, functions and principles of medical
devices (which are the invariant components) and uses specific designs and
constructions to illustrate the concepts where appropriate.
vii

---

## Page 8

viii                                  Biomedical Device Technology
The first part of this book discusses the fundamental building blocks of
biomedical instrumentations. Starting from an introduction of the origins of
biological signals, the essential functional building blocks of a typical med-
ical device are studied. These functional blocks include electrodes and trans-
ducers, biopotential amplifiers, signal conditioners and processors, electrical
safety and isolation, and output devices. The next section of the book covers
a selection of biomedical devices. Their principles of operations, functional
building blocks, special features, performance specifications are discussed.
Architectural and schematic diagrams are used where appropriate to illus-
trate how specific device functions are being implemented. In addition, indi-
cations of use and clinical applications of each device are included.
Common problems and hazards, and risk mitigation of each device are dis-
cussed. For those who would like to know more, a collection of relevant pub-
lished papers and book references has been added to the end of each chap-
ter.
Due to the vast variety of biomedical devices available in healthcare, it
is impractical to include all of them in a single book. This book selectively
covers diagnostic and therapeutic devices that are either commonly used or
whose principles and design represent typical applications of the technology.
To limit the scope, medical imaging equipment and laboratory instrumenta-
tions are excluded from this book.
Four appendices are included at the end of the book. These are append-
ed for those who are not familiar with these concepts, yet an understanding
in these areas will enhance the comprehension of the subject matters in the
book. They are A1-A Primer on Fourier Analysis, A2-Overview of Medical
Telemetry Development, A3-Medical Gas Supply Systems, and the newest
addition A4-Concepts of Infection Control in Biomedical Device
Technology.
In this third edition, many chapters have gone through revisions, some
with significant updates and additions to keep up with new applications and
advancements in medical technology. Based on requests, review questions
are added for each chapter to help readers to assess their comprehension of
the content material.
I am thankful to the readers, educators, and professionals who provided
me with invaluable suggestions for this revision. I also would like to take the
opportunity to thank Professor Euclid Seeram for inspiring me into book
publishing, and Michael Thomas for his continuing support in publishing
this new edition.


Anthony Y. K. Chan

---

## Page 9

CONTENTS


                                                                                                                 Page
Preface . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .vii

Chapter
PART I—INTRODUCTION

   1.  Overview of Biomedical Instrumentation . . . . . . . . . . . . . . . . . . . . 5
   2.  Concepts in Signal Measurement, Processing, and Analysis . . . . . 33

PART II—BIOMEDICAL TRANSDUCERS

   3.  Fundamentals of Biomedical Transducers . . . . . . . . . . . . . . . . . . . 55
   4.  Pressure and Force Transducers . . . . . . . . . . . . . . . . . . . . . . . . . . . 67
   5.  Temperature Transducers . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 80
   6.  Position and Motion Transducers . . . . . . . . . . . . . . . . . . . . . . . . . 103
   7.  Flow Transducers . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 112
   8.  Optical Transducers . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 126
   9.  Electrochemical Transducers . . . . . . . . . . . . . . . . . . . . . . . . . . . . 151
  10.  Biopotential Electrodes . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 178

PART III—FUNDAMENTAL BUILDING BLOCKS
OF MEDICAL INSTRUMENTATION

  11.  Biopotential Amplifiers . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 191
  12.  Electrical Safety and Signal Isolation . . . . . . . . . . . . . . . . . . . . . . 216
  13.  Medical Waveform Display Systems . . . . . . . . . . . . . . . . . . . . . . 237

ix

---

## Page 10

PART IV—MEDICAL DEVICES

  14.  Physiological Monitoring Systems . . . . . . . . . . . . . . . . . . . . . . . . 265
  15.  Electrocardiographs . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 283
  16.  Electroencephalographs . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 312
 17.  Electromyography and Evoked Potential Study Equipment . . . . 334
  18.  Invasive Blood Pressure Monitors . . . . . . . . . . . . . . . . . . . . . . . . 352
  19.  Noninvasive Blood Pressure Monitors . . . . . . . . . . . . . . . . . . . . . 371
  20.  Cardiac Output Monitors . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 384
  21.  Cardiac Pacemakers . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 405
  22.  Cardiac Defibrillators . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 427
  23.  Infusion Devices . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 448
  24.  Electrosurgical Units . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 474
  25.  Pulmonary Function Analyzers . . . . . . . . . . . . . . . . . . . . . . . . . . 495
  26.  Mechanical Ventilators . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 513
 27.  Ultrasound Blood Flow Detectors . . . . . . . . . . . . . . . . . . . . . . . . 535
  28.  Fetal Monitors . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 545
  29.  Infant Incubators, Phototherapy Lights, Warmers and
             Resuscitators . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 552
  30.  Body Temperature Monitors . . . . . . . . . . . . . . . . . . . . . . . . . . . . 566
  31.  Pulse Oximeters, Oxygen Analyzers & Transcutaneous
             Oxygen Monitors . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 582
  32.  End-Tidal Carbon Dioxide Monitors . . . . . . . . . . . . . . . . . . . . . . 600
  33.  Anesthesia Machines . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 607
  34.  Dialysis Equipment . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 627
  35.  Surgical Lasers . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 654
  36.  Endoscopic Video Systems . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 679
 37.  Cardiopulmonary Bypass Units . . . . . . . . . . . . . . . . . . . . . . . . . . 701
  38.  Audiology Equipment . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 718

Appendices
A-1.   A Primer on Fourier Analysis . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 753
A-2.   Overview of Medical Telemetry Development . . . . . . . . . . . . . . . . . . . . 758
A-3.   Medical Gas Supply Systems . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 762
A-4.   Concepts in Infection Control of Biomedical Device Technology . . . . . . . 765

Review Questions . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 773
Answers to Review Questions . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 848
Index . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 873
x                                     Biomedical Device Technology

---

## Page 11

BIOMEDICAL DEVICE TECHNOLOGY

---

## Page 12

*(No extractable text on this page)*

---

## Page 13

Part I

INTRODUCTION

---

## Page 14

*(No extractable text on this page)*

---

## Page 15

Chapter 1

OVERVIEW OF BIOMEDICAL
 INSTRUMENTATION


OBJECTIVES

•
Define medical device.
•
Analyze biomedical instrumentation using a systems approach.
•
Explain the origin and characteristics of biopotentials and common phys-
iological signals.
•
Introduce human factors engineering in medical device design.
•
List common input, output, and control signals of medical devices.
•
Discuss special constraints encountered in the design of biomedical
devices.
•
Define biocompatibility and list common implant materials.
•
Explain tissue responses to foreign materials and state approaches to
avoid adverse tissue reaction.
•
Describe the basic functional building blocks of medical instrumentation.


CHAPTER CONTENTS

 1. Introduction
 2. Classification of Medical Devices
 3. Systems Approach
 4. Origins of Biopotentials
 5. Physiological Signals
 6. Human–Machine Interface
7. Input, Output, and Control Signals
 8. Constraints in Biomedical Signal Measurements
 9. Concepts on Biocompatibility
10. Functional Building Blocks of Medical Instrumentation


5

---

## Page 16

6                                     Biomedical Device Technology
INTRODUCTION

Medical devices come with different designs and complexity. They can
be as simple as a tongue depressor, as compact as an implantable pacemak-
er, or as sophisticated as a heart lung machine. Although most medical
devices use similar technology as other consumer or industrial devices, there
are many fundamental differences between devices used in medicine and
devices used in other applications. This chapter will look at the definition of
medical devices and the characteristics that differentiate a medical device
from other household or consumer products.
According to the International Electrotechnical Commission (IEC), a
medical device means:

Any instrument, apparatus, implement, appliance, implant, in vitro reagent or
calibrator, software, material or other similar or related article:
a) intended by the manufacturer to be used, alone or in combination, for
human beings for one or more of the specific purpose(s) of:
•
diagnosis, prevention, monitoring, treatment, or alleviation of disease,
•
diagnosis, monitoring, treatment, alleviation of, or compensation for an
injury,
•
investigation, replacement, modification, or support of the anatomy or of
a physiological process,
•
supporting or sustaining life,
•
control of conception,
•
disinfection of medical devices,
•
providing information for medical purposes by means of in vitro exami-
nation of specimens derived from the human body, and
b) which does not achieve its primary intended action in or on the human body
by pharmacological, immunological or metabolic means, but which can be
assisted in its function by such means.

The United States Food and Drug Administration (FDA) defines a med-
ical device as:

An instrument, apparatus, implement, machine, contrivance, implant, in vitro
reagent, or other similar or related article, including a component part, or acces-
sory which is:
•
recognized in the official National Formulary, or the United States
Pharmacopoeia, or any supplement to them,
•
intended for use in the diagnosis of disease or other conditions, or in the
cure, mitigation, treatment, or prevention of disease, in man or other ani-
mals, or
•
intended to affect the structure or any function of the body of man or other
animals, and which does not achieve any of its primary intended purposes

---

## Page 17

Overview of Biomedical Instrumentation                             7
through chemical action within or on the body of man or other animals and
which is not dependent upon being metabolized for the achievement of any
of its primary intended purposes.

In the Canadian Food and Drugs Act, a medical device is similarly
defined as:

Any article, instrument, apparatus or contrivance, including any component,
part or accessory thereof, manufactured, sold or represented for use in:
(a) the diagnosis, treatment, mitigation or prevention of a disease, disorder or
abnormal physical state, or the symptoms thereof, in humans or animals;
(b) restoring, correcting or modifying a body function, or the body structure of
humans or animals;
(c) the diagnosis of pregnancy in humans or animals; or
(d) the care of humans or animals during pregnancy, and at, and after, birth of
the offspring, including care of the offspring, and includes a contraceptive
device but does not include a drug.

Apart from the obvious, it is clear from the above definitions that in vitro
diagnostic products such as medical laboratory instruments are medical
devices. Furthermore, accessories, reagents, or spare parts associated with a
medical device are also considered to be medical devices. An obvious exam-
ple of this is the electrodes of a heart monitor. Another example, which may
not be as obvious, is the power adapter to a laryngoscope. Both of these
accessories are considered as medical devices and are therefore regulated by
the premarket and postmarket regulatory controls.


CLASSIFICATION OF MEDICAL DEVICES

There are many different ways to classify or group together medical
devices. Devices can be grouped by their functions, their technologies, or their
applications. A description of some common classification methods follows.

Classified by Functions

Grouping medical devices by their functions is by far the most common
way to classify medical devices. Devices can be separated into two main cat-
egories: diagnostic and therapeutic.
Diagnostic devices are used for the analysis or detection of diseases,
injuries, or other medical conditions. Ideally, a diagnostic device should not
cause any change to the structure or function of the biological system.
However, some diagnostic devices may disrupt the biological system due to

---
