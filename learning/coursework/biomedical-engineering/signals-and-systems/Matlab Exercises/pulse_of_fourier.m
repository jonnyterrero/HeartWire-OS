clc;
fs = 100;
dt = 1/fs;
total_time = 20;
N = fs * total_time;
t = (0:(N-1)) * dt;
x = zeros(N);

% Rectangular pulse: amplitude 3 from t = 0 to t < 2 s (for loop)
for k = 1:N
    if t(k) >= 0 && t(k) < 2
        x(k) = 3;
    else
        x(k) = 0;
    end
end

% Fourier transform (same scaling as course notes)
K = N;
df = fs / K;
f = (0:K - 1) * df;
X = fft(x) * dt;
X_mag = abs(X);

% Total energy — time domain: E = integral |x(t)|^2 dt  ~  sum |x[n]|^2 * dt
E_time = dt * sum(abs(x).^2);
% Same total from frequency domain (Parseval with X = fft(x)*dt): E = sum |X[k]|^2 * df
E_freq = df * sum(abs(X).^2);

fprintf('Total energy from time:   E = dt * sum(|x|^2) = %.6f\n', E_time);
fprintf('Total energy from freq:   E = df * sum(|X|^2) = %.6f\n', E_freq);

% --- Plots: signal + energy in time; spectrum + energy in frequency ---
figure;
subplot(2, 1, 1);
plot(t, x);
xlabel('Time (s)');
ylabel('Amplitude');
title('Rectangular Pulse (A = 3, 0 to 2 s)');
axis([0 20 0 3]);
grid on;

subplot(2, 1, 2);
plot(t, abs(x).^2);
xlabel('Time (s)');
ylabel('|x(t)|^2');
title('Energy density in time (instantaneous power)');
axis([0 20 0 9]);
grid on;

figure;
subplot(2, 1, 1);
plot(f, X_mag);
xlabel('Frequency (Hz)');
ylabel('|X(f)|');
title('Magnitude spectrum');
xlim([0 100]);
ylim([0 6]);
grid on;

subplot(2, 1, 2);
plot(f, abs(X).^2);
xlabel('Frequency (Hz)');
ylabel('|X(f)|^2');
title('Energy density in frequency (contribution per Hz)');
xlim([0 100]);
grid on;
