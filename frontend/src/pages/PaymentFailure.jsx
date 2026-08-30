import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { AlertTriangle, ArrowRight, RefreshCcw } from 'lucide-react';

const PaymentFailure = () => {
  return (
    <MainLayout>
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
        <span className="text-xs font-bold uppercase tracking-widest text-red-500 block mb-2">Payment Failed</span>
        <h1 className="text-3xl font-bold font-display text-white uppercase tracking-wider mb-4">
          Transaction declined
        </h1>
        <p className="text-secondary text-sm mb-8 leading-relaxed">
          We couldn't process your payment. This could be due to incorrect details, insufficient funds, or network disruption. Don't worry, no money was debited from your account.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/checkout"
            className="bg-white text-black font-bold uppercase tracking-wider text-xs px-8 py-4 rounded hover:bg-zinc-200 transition-colors inline-flex items-center justify-center gap-2"
          >
            <RefreshCcw size={14} /> Retry Payment
          </Link>
          <Link
            to="/cart"
            className="border border-border text-secondary hover:text-white font-semibold uppercase tracking-wider text-xs px-8 py-4 rounded transition-colors inline-flex items-center justify-center gap-2"
          >
            Return to Cart <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentFailure;
