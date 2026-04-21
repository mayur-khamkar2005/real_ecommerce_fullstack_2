import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const formatTime = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h.toString().padStart(2, '0')}:${m
    .toString()
    .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// ✅ NEW: result formatter
const formatResult = (r) => {
  if (!r) return '';
  if (r === 'NO_REWARD') return 'Better Luck';
  return `${r}% OFF`;
};



const Games = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [timerMs, setTimerMs] = useState(0);
  const [lastCoupon, setLastCoupon] = useState(null);
  const [spinRotation, setSpinRotation] = useState(0);
  const [spinResult, setSpinResult] = useState(null);

  const canClaim = Boolean(status?.rewardGiven && !status?.rewardClaimed);

  const loadStatus = async () => {
    try {
      const { data } = await api.get('/games/status');

      const normalized = {
        ...data.data,
        canSpin: data.data.canSpin ?? data.data.canPlay ?? false,
        nextSpinIn: data.data.nextSpinIn ?? data.data.msRemaining ?? 0,
      };

      setStatus(normalized);
      setTimerMs(normalized.nextSpinIn || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load game status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  useEffect(() => {
    if (timerMs <= 0) return;
    const tick = setInterval(() => {
      setTimerMs((prev) => (prev > 1000 ? prev - 1000 : 0));
    }, 1000);
    return () => clearInterval(tick);
  }, [timerMs]);

  const playGame = async () => {
    setSpinning(true);
    setSpinResult(null);
    setLastCoupon(null);

    try {
      const { data } = await api.post('/games/play');
      const res = data.data;

      const spinAngle = 1800 + Math.floor(Math.random() * 720);
      setSpinRotation((prev) => prev + spinAngle);

      setStatus((prev) => ({
        ...(prev || {}),
        canSpin: false,
        nextSpinIn: res.nextSpinIn,
        nextPlayableAt: res.nextPlayableAt,
        lastResult: res.result,
        rewardGiven: res.rewardGiven,
        rewardClaimed: !res.canClaim,
      }));

      setTimerMs(res.nextSpinIn || 0);

      setTimeout(() => {
        setSpinResult(res.result);
        toast.success(`Spin Result: ${formatResult(res.result)}`); // ✅ FIXED
      }, 2600);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to spin right now');
    } finally {
      setTimeout(() => setSpinning(false), 2800);
    }
  };

  const claimReward = async () => {
    setClaiming(true);
    try {
      const { data } = await api.post('/games/claim');
      setLastCoupon(data.data);

      toast.success(`Coupon claimed: ${data.data.code}`);

      await loadStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to claim reward');
    } finally {
      setClaiming(false);
    }
  };

  const statusText = useMemo(() => {
    if (!status) return 'Loading...';
    if (status.canSpin || timerMs <= 0) return 'Ready to spin';
    return `Next spin in ${formatTime(timerMs)}`;
  }, [status, timerMs]);

  if (loading) {
    return (
      <div className="p-12 text-center text-textMuted text-xs uppercase tracking-widest">
        Game status…
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-8">
      <div className="card p-8">
        <h1 className="text-2xl font-black mb-2">Spin & Win</h1>
        <p className="text-textMuted mb-6">
          One spin every 24 hours. Spin now and claim coupon if rewarded.
        </p>

        {/* 🎡 Wheel */}
        <div className="mb-7 flex flex-col items-center">
          <div className="relative w-56 h-56 border-4 border-border shadow-lg bg-surface overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[10px] border-r-[10px] border-t-0 border-b-[16px] border-l-transparent border-r-transparent border-b-secondary" />
            <div
              className="w-full h-full"
              style={{
                transform: `rotate(${spinRotation}deg)`,
                transition: spinning
                  ? 'transform 2.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
                  : 'none',
                background:
                  'conic-gradient(#4f46e5 0deg 72deg, #3730a3 72deg 144deg, #6366f1 144deg 216deg, #1e293b 216deg 288deg, #0f172a 288deg 360deg)',
              }}
            />
          </div>

          <div className="mt-3 text-xs uppercase tracking-widest text-textMuted">
            Wheel: 10%, 15%, 20%, Better Luck
          </div>
        </div>

        {/* 📊 Status */}
        <div className="border border-border p-4 mb-6 bg-backgroundElevated">
          <div className="text-xs uppercase tracking-wider text-textMuted mb-1">
            Status
          </div>

          <div className="text-lg font-mono font-bold text-secondary">
            {statusText}
          </div>

          {status?.lastResult && (
            <div className="mt-2 text-sm text-textMain">
              Last result:{' '}
              <span className="font-bold uppercase">
                {formatResult(spinResult || status.lastResult)} {/* ✅ FIXED */}
              </span>
              {status.rewardGiven
                ? ' • Reward available'
                : ' • No reward this round'}
            </div>
          )}
        </div>

        {/* 🎮 Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-primary px-6 py-3"
            onClick={playGame}
            disabled={spinning || (!status?.canSpin && timerMs > 0)}
          >
            {spinning ? 'Spinning…' : 'Spin Now 🎡'}
          </button>

          <button
            type="button"
            className="btn-secondary px-6 py-3"
            onClick={claimReward}
            disabled={!canClaim || claiming}
          >
            {claiming ? 'Claiming…' : 'Claim Reward'}
          </button>
        </div>

        {/* 🎁 Coupon */}
        {lastCoupon && (
          <div className="mt-6 border border-secondary/50 p-4 bg-secondary/10">
            <div className="text-xs uppercase tracking-wider text-textMuted mb-1">
              Coupon Awarded
            </div>
            <div className="font-mono font-bold text-secondary">
              {lastCoupon.code}
            </div>
            <div className="text-sm text-textMain mt-1">
              Discount: {lastCoupon.discount}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;