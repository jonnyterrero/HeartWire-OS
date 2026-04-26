% Pre-lab exercise 3-5

% Enter your values for the input variables in the blank spaces below.
R = ;  			% resistor value (ohms) 
Rin = 50;  		% thevinin resistance (ohms) 
L = ;  			% inductor value (henries)
C = ;  			% capacitor value (farads) 
Reff = R+Rin;

num = [R 0]             % numerator in the transfer function
den = [L Reff (1/C)];   % denominator in the transfer function
HS = tf(num, den)       % construct a transfer function data structure in Matlab

omegaS = logspace(log10(2*pi*1e3), log10(2*pi*100e3), 1000);   % create a vector containing frequencies

[MAG, PHASE] = bode(HS, omegaS);    % plotting the Bode plot

loglog(omegaS/(2*pi*10e3),MAG(:));  % magnitude vs. driving frequncy 
grid on;                            % turn on the grid for the plot

semilogx(omegaS/(2*pi*10e3), PHASE(:));	 % phase vs. driving frequncy 
grid on;                                 % turn on the grid for the plot
