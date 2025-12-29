import traceLogoNude from '@/assets/svg/trace_logo_nude.svg'
import { AIInputSearch } from '@/components/common/AIInputSearch'
import { motion } from 'framer-motion'

export function FeatureCarousel() {
  return (
    <div className='relative h-full w-full origin-center overflow-hidden rounded-2xl'>
      <div className='absolute inset-0 bg-linear-to-b from-orange-500/80 via-orange-400/50 to-orange-500/70' />
      <div className='absolute inset-0 bg-linear-to-tr from-orange-500/30 via-transparent to-orange-500/60' />
      <motion.div
        className='absolute -top-6 right-0 h-2/3 w-2/3 bg-gradient-radial from-primary/64 via-primary/34 to-transparent dark:from-primary/56 dark:via-primary/30 dark:to-transparent blur-3xl'
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className='absolute -bottom-6 left-0 h-1/2 w-1/2 bg-gradient-radial from-primary/70 via-primary/36 to-transparent dark:from-primary/60 dark:via-primary/32 dark:to-transparent blur-2xl'
        animate={{
          x: [0, -30, 0],
          y: [0, -20, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <img
        src={traceLogoNude}
        alt=''
        aria-hidden='true'
        className='absolute left-1/2 top-1/2 z-10 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 opacity-[0.1] sm:h-[36rem] sm:w-[36rem] lg:h-[50rem] lg:w-[50rem]'
      />
      {/* <CurvyLine className='absolute inset-0 z-10 h-full w-full scale-[1.2] opacity-55' /> */}

      <div className='relative z-20 flex h-full gap-6 p-6 sm:p-8'>
        {/* Left Section - 65% */}
        <div className='relative flex w-full flex-col lg:w-[65%]'>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className='mt-4 scale-100 sm:scale-110 lg:scale-140 lg:ml-28'>
            <h1 className='text-white dark:text-white/90 text-4xl font-semibold tracking-tight'>
              <span className='flex items-center gap-2'>
                <img
                  src={traceLogoNude}
                  alt='Trace logo'
                  className='h-6 w-6 shrink-0'
                />
                <span>Trace</span>
              </span>
              <span className='mt-1 block text-white/85 text-3xl '>
                A Document Intelligent Tool
              </span>
            </h1>
            <p className='mt-1 text-white/80 text-xl font-medium italic font-["EB_Garamond"]'>
              — AI-powered research through your files
            </p>
          </motion.div>

          {/* AI Input Search Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className='absolute right-0 top-1/2 w-full -translate-y-1/2 translate-x-0 sm:translate-x-[20%] lg:translate-x-[50%] xl:translate-x-[70%]'>
            <AIInputSearch />
          </motion.div>

          {/* Footer Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className='mt-auto flex items-center justify-start'>
            <div className='text-xs font-semibold uppercase tracking-wider text-white/70 dark:text-white/50'>
              Two Modes • One Platform
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
