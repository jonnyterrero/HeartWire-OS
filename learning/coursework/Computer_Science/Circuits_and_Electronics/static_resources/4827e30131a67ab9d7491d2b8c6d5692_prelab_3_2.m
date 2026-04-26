% Pre-lab exercise 3-2

% input variables
L = 47e-3;  			% inductor value (henry) i.e. 47e-3
C = 0.0047e-6; 	 		% capacitor value (farads) i.e. .0047e-6
R = 220;     			% resistor value (ohms) i.e. 220 or 1000
RIN = 50;    			% thevinin resistance (ohms) i.e. 50
VTI = 10;    			% input step voltage (ohms) i.e. 10
Reff = R + RIN;    		% resistance of circuit

% step response
t = linspace(0, 0.3e-3, 1000);	% time vector with 1000 points spanning 0 to 300 microseconds

alphaT = ;     			% insert alpha relation from Prelab 3-1
omegaT = ;  			% insert damped natural frequency relation 
VTO = ;           		% insert output constant relation 
phiT = ;                        % insert phase shift relation

vOUT = VTO*exp(-1*alphaT*t).*sin(omegaT*t+phiT);  % transient solution

plot(t, vOUT);   		% plotting vs. time
grid on;                        % plot grid on the figure


