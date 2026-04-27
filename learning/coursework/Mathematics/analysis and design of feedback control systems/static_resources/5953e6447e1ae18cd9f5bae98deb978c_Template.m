%% 2.14/0 Design Problem TEMPLATE
% Darya Amin-Shahidi, May 3., 2011
% DL Trumper April, 27, 2014

%%
% Please use this template to present your design during the check-off.

% - You are required to add your code to perform the different design tasks
% and initialize the transfer functions and variable declared as [] within the
% template.

% - The template will generate the required plots based on your design.

% - The variable names used here match the diagrams and the text of the 
%   design problem.

% - Do not change any variable names declared here and do not overwrite 
% the values given in the problem set.

%% Values and data given in the problem statement
Rc=4;       %coil resistance
Lc=2e-4;    %coil inductance
Kf=20;      %motor constant
R1=10e3;    %value of resistance R1
Rs=0.2;     %value of sense resistance
Ga=-0.5;    %closed loop low-freq gain of the current amplifier
G1=5e5;     %capacitive probe sensor's gain

load 'testfreqdata';    % loads the experimental data on the 
                        % mechanical plant Gp=X/F
                        % Make sure the data file is stored in the same
                        % folder


%% 2) Electrical Loop Design
% Initialize the following transfer functions
P_elec = [] %electrical plant transfer function: Vs/Vc

% Designing the current controller
R2 = [] %value of resistor R2
R3 = [] %value of resistor R3
C1 = [] %value of capacitor C1
C2 = [] %value of capacitor C2

C_elec = [] %electrical controller transfer function Vc/Vs
            %specify the transfer function in terms of the resistor and
            %capacitor values given above

L_elec = P_elec * C_elec;    %electrical loop return ratio

% Plot the loop-shaping results for the electrical loop
figure;
bode(P_elec);
hold on;
bode(C_elec);
margin(L_elec);
grid on;

%% 3-5) Mechanical Loop Design
% Initialize the following transfer functions

Gp = [] % fitted mechanical plant Gp_fit=X/F

if(1) %The default is 1 for undergraduate students
    C_mech = [] % mechanical controller V_set/V_e with no AFC
                % this must be initialized by both graduate and
                % undergraduate students
else
    C_mech = [] % mechanical controller V_set/V_e with AFC
                % this must be initialized by graduate students only
end

L_mech = C_mech*Ga*Kf*Gp*G1; %mechanical loop return ratio

% Plot the loop-shaping results for the electrical loop
[Pm Pp]=bode(Gp,ww); Pm=Pm(:); Pp=Pp(:);
[Cm Cp]=bode(C_mech,ww); Cm=Cm(:); Cp=Cp(:);
[Lm Lp]=bode(L_mech,ww); Lm=Lm(:); Lp=Lp(:);
figure;
subplot(2,1,1)
loglog(ww,Gpmag,'Linewidth',2);
hold on;
loglog(ww,Pm,'g',ww,Cm,'r',ww,Lm,'k');
legend('Gp','Gp_f_i_t','C','L')
title('Mech. Loop Shaping Design')
ylabel('Magnitude');
xlabel('\omega [rad/s]');
grid on;
subplot(2,1,2)
semilogx(ww,Gpphase,'Linewidth',2);
hold on;
semilogx(ww,Pp,'g',ww,Cp,'r',ww,Lp,'k');
ylabel('Phase [deg]');
xlabel('\omega [rad/s]');
grid on;

figure; 
nyquist(L_mech);        %Nyquist Plot

L_mechS=ss(L_mech);     % the transfer function is converted to state space
                        % to allow arithmetic with the delay term
S=feedback(1,L_mechS);  %sensitivity transfer function
figure;
bode(S)                 %Bode Plot of the sensitivity
title('sensitivity')
grid on;
%% Simulate Time Response
wr=3e3; %frequency of the reference signal [rad/s]
fr=wr/(2*pi); %frequency of the reference signal [Hz]
t=0:(1/fr/100):(1/fr)*100; %simulation time = 100 cycles
x_ref=1e-5*sin(wr*t); % position reference signal (x_ref) [m]

CL=feedback(L_mechS,1); %closed loop x/x_ref transfer function
figure;
x=lsim(CL,x_ref,t); %simulate the response to x_ref
e=x'-x_ref; %tracking error
plot(t,x_ref*1e9,t,x*1e9,t,e*1e9);
xlim([.95*t(end) t(end)])
legend('x_{ref}','x','e');
title('Response to Reference')
ylabel('Position [nm]')
xlabel('time [s]')
grid on;

wn=1e5; %frequency of the reference signal [rad/s]
fn=wn/(2*pi); %frequency of the noise signal [Hz]
t=0:(1/fn/100):(1/fn)*100; %simulation time = 100 cycles
Vn=5e-2*sin(wn*t); % noise signal (x_ref) [V]
CLn=(-L_mechS/G1)/(1+L_mechS); % x/Vn transfer function
figure;
e=lsim(CLn,Vn,t); %simulate r4esponse to noise
plot(t,Vn/G1*1e9,t,e*1e9);
xlim([.95*t(end) t(end)])
legend('noise','error');
title('Response to Reference')
ylabel('Position [nm]')
xlabel('time [s]')
grid on;