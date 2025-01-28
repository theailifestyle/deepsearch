import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import { TimelineEvent } from '@/types/content';

interface CheatsheetPDFProps {
  topic: string;
  description: string;
  historicalTimeline: TimelineEvent[];
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
    color: '#4338ca',
  },
  description: {
    marginBottom: 20,
    fontSize: 12,
    color: '#333',
    lineHeight: 1.6,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 15,
    marginBottom: 10,
    color: '#444',
    fontWeight: 'bold',
  },
  timelineEvent: {
    marginBottom: 15,
    paddingLeft: 15,
    borderLeft: '2 solid #e5e7eb',
  },
  date: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4338ca',
    marginBottom: 4,
  },
  event: {
    fontSize: 14,
    marginVertical: 5,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  significance: {
    marginTop: 5,
    fontStyle: 'italic',
    color: '#666',
  },
  content: {
    marginBottom: 10,
    lineHeight: 1.6,
    color: '#374151',
  },
  resources: {
    marginTop: 8,
    paddingLeft: 10,
  },
  resourceTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#4b5563',
  },
  resourceItem: {
    marginBottom: 6,
    padding: 6,
    borderRadius: 4,
    borderLeftWidth: 2,
    borderColor: '#e5e7eb',
  },
  resourceLink: {
    fontSize: 10,
    color: '#2563eb',
    textDecoration: 'none',
  },
  resourceMeta: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 2,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#666',
  },
});

export default function CheatsheetPDF({ topic, description, historicalTimeline }: CheatsheetPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{topic}</Text>
        <Text style={styles.description}>{description}</Text>

        <Text style={styles.subtitle}>Historical Timeline</Text>
        {historicalTimeline.map((event, index) => (
          <View key={index} style={styles.timelineEvent}>
            <Text style={styles.date}>{event.date}</Text>
            <Text style={styles.event}>{event.event}</Text>
            <Text style={styles.content}>{event.description}</Text>
            <Text style={styles.significance}>Significance: {event.significance}</Text>

            {event.resources && event.resources.length > 0 && (
              <View style={styles.resources}>
                <Text style={styles.resourceTitle}>Additional Resources:</Text>
                {event.resources.map((resource, resourceIndex) => (
                  <View 
                    key={resourceIndex} 
                    style={[
                      styles.resourceItem,
                      {
                        borderLeftColor: 
                          resource.difficulty === 'foundational' ? '#22c55e' :
                          resource.difficulty === 'intermediate' ? '#3b82f6' :
                          '#9333ea'
                      }
                    ]}
                  >
                    <Link src={resource.url} style={styles.resourceLink}>
                      {resource.title || resource.url}
                    </Link>
                    <Text style={styles.resourceMeta}>
                      {resource.type.toUpperCase()} • {resource.difficulty}
                      {resource.author && ` • by ${resource.author}`}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <Text style={styles.pageNumber}>1</Text>
      </Page>
    </Document>
  );
}