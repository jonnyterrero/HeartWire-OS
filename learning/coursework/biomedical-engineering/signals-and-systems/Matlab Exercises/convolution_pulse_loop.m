% N = total number of points or samples
% n = vector of integers from 0 to N-1
% dt = interval of time between samples in seconds
clc
N = 2000;
dt = 0.01;
n = 0:1:(N-1);
t = n*dt;

% Impulse response
h = 1.0*exp(-1*t);
dL = dt;

% Pulse x(t): ramp 0-5 s, flat 5-10 s, zero elsewhere
x = zeros(size(t));
for i = 1:length(t)
    if t(i) >= 0 && t(i) < 5
        x(i) = 4*t(i);
    elseif t(i) >= 5 && t(i) < 10
        x(i) = 20;
    else
        x(i) = 0;
    end
end

% Convolution y = x * h: y(k) = sum_L x(L)*h(k-L+1)*dL
y = zeros(size(n));
for k = 1:N
    s = 0.0;
    for L = 1:k
        if (k - L + 1) >= 1 && (k - L + 1) <= N
            s = s + x(L)*h(k - L + 1)*dL;
        end
    end
    y(k) = s;
end

% Plot both: pulse and convolution, labeled
figure(1)

subplot(2,1,1)
plot(t, x, 'b')
xlim([0 20])
ylim([0 25])
xlabel('t (s)')
ylabel('Amplitude')
title('Pulse x(t)')
grid on

subplot(2,1,2)
plot(t, y, 'r')
xlim([0 20])
xlabel('t (s)')
ylabel('Amplitude')
title('Convolution y(t)')
grid on
