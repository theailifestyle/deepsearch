import { TopicContent } from '@/types/content';

export const sampleContent: TopicContent = {
  topic: "Marxism",
  shortSummary: "A socio-economic theory and method of analysis developed by Karl Marx that critiques capitalism and proposes revolutionary social change.",
  explanations: {
    simple: "Marxism is a way of thinking that says society is divided between workers and business owners. It argues that this setup is unfair to workers and should be changed so everyone shares resources equally.",
    detailed: "Marxism analyzes how capitalism creates class divisions between workers (proletariat) and owners (bourgeoisie). It examines how economic systems shape society and argues for collective ownership of production means."
  },
  historicalTimeline: [
    {
      date: "1848",
      event: "The Communist Manifesto Published",
      description: "Marx and Engels publish their influential pamphlet outlining communist theory and calling for working class revolution.",
      significance: "Established the foundational principles of Marxist thought and revolutionary socialism.",
      resources: [
        {
          type: 'article',
          url: 'https://plato.stanford.edu/entries/marx/',
          title: 'Introduction to Marx and Marxism',
          author: 'Stanford Encyclopedia of Philosophy',
          difficulty: 'foundational'
        },
        {
          type: 'video',
          url: 'https://www.youtube.com/watch?v=fSQgCy_iIcc',
          title: 'Marx and The Communist Manifesto Explained',
          difficulty: 'intermediate'
        },
        {
          type: 'book',
          url: 'https://www.marxists.org/archive/marx/works/1848/communist-manifesto/',
          title: 'The Communist Manifesto - Original Text',
          author: 'Marx and Engels',
          difficulty: 'advanced'
        }
      ]
    },
    {
      date: "1867",
      event: "Das Kapital Vol. 1 Published",
      description: "Marx publishes the first volume of his masterwork analyzing capitalism and its internal contradictions.",
      significance: "Provided a comprehensive critique of political economy and capitalist mode of production.",
      resources: [
        {
          type: 'wiki',
          url: 'https://en.wikipedia.org/wiki/Das_Kapital',
          title: 'Das Kapital Overview',
          difficulty: 'foundational'
        },
        {
          type: 'video',
          url: 'https://www.youtube.com/watch?v=GnEWOYKgI4o',
          title: 'Understanding Das Kapital',
          difficulty: 'intermediate'
        },
        {
          type: 'article',
          url: 'https://www.marxists.org/archive/marx/works/1867-c1/',
          title: 'Das Kapital Volume One',
          author: 'Karl Marx',
          difficulty: 'advanced'
        }
      ]
    },
    {
      date: "1871",
      event: "Paris Commune",
      description: "First working class revolution that Marx analyzed as an example of the 'dictatorship of the proletariat'.",
      significance: "Provided a real-world example of workers' self-governance and influenced future revolutionary movements.",
      resources: [
        {
          type: 'article',
          url: 'https://www.history.com/topics/france/paris-commune',
          title: 'The Paris Commune: A Brief History',
          difficulty: 'foundational'
        },
        {
          type: 'video',
          url: 'https://www.youtube.com/watch?v=zXlHGseyvfw',
          title: 'The Paris Commune: When Workers Took Power',
          difficulty: 'intermediate'
        },
        {
          type: 'book',
          url: 'https://www.marxists.org/archive/marx/works/1871/civil-war-france/',
          title: 'The Civil War in France',
          author: 'Karl Marx',
          difficulty: 'advanced'
        }
      ]
    }
  ]
};