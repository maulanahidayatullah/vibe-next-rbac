'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const t = useTranslations();
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />

      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-20 left-10 w-72 h-72 rounded-full theme-gradient opacity-10 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full theme-gradient opacity-10 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full theme-gradient opacity-5 blur-3xl"
        />
      </div>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-2xl theme-gradient flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/30 animate-float">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
              <line x1="12" y1="22" x2="12" y2="15.5" />
              <polyline points="22 8.5 12 15.5 2 8.5" />
            </svg>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4"
        >
          <span className="theme-gradient-text">{t('common.appName')}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8"
        >
          Enterprise-grade multi-tenant administration portal with futuristic design,
          role-based access control, and beautiful user experience.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex gap-4 flex-wrap justify-center"
        >
          <Button
            size="lg"
            onClick={() => router.push('/login')}
            className="theme-gradient text-white shadow-2xl shadow-primary/25 px-8 h-12 text-base"
            id="hero-login-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            {t('auth.login')}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="glass h-12 text-base px-8"
            id="hero-dashboard-button"
          >
            {t('nav.dashboard')}
          </Button>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 max-w-4xl w-full"
        >
          {[
            { title: 'Multi-Tenant', desc: 'Isolated tenant environments with dedicated settings', icon: '🏢' },
            { title: 'RBAC Security', desc: 'Fine-grained role-based access control', icon: '🛡️' },
            { title: 'i18n Ready', desc: 'Indonesian, English, and Japanese localization', icon: '🌐' },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass rounded-2xl p-6 text-left"
            >
              <span className="text-3xl mb-3 block">{feature.icon}</span>
              <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
