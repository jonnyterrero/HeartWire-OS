% N = total number of points, n = index 0 to N-1, dt = sample interval (s)
clc
N = 2000;
dt = 0.01;
n = 0:(N-1);
t = n*dt;

% Impulse response
h = 1.0*exp(-t);

% Input pulse x(t): ramp 0-5s, flat 5-10s, zero elsewhere
x = zeros(size(t));
x(t < 5)  = 4*t(t < 5);
x(t >= 5 & t < 10) = 20;

% Convolution y = x * h (scale by dt for continuous-time interpretation)
y = conv(x, h)*dt;
ty = (0:length(y)-1)*dt;

% Plot
figure(1)

subplot(2,1,1)
plot(t, x, 'b')
xlim([0 20])
ylim([0 25])
xlabel('t (s)')
ylabel('x(t)')
title('Pulse x(t)')
grid on

subplot(2,1,2)
plot(ty, y, 'r')
xlim([0 20])
xlabel('t (s)')
ylabel('y(t)')
title('Convolution y(t)')
grid on
