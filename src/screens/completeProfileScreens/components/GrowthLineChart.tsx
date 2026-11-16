import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../units/Colors';

export interface GrowthLineChartProps {
  currentHeight?: string;
  measuredDate?: string;
  weight?: string;
  grewThisYear?: string;
  nextMeasureDate?: string;
}

const GrowthLineChart: React.FC<GrowthLineChartProps> = ({
  currentHeight = '132 cm',
  measuredDate = 'Measured 12 Oct 2026',
  weight = '28 kg',
  grewThisYear = '+5 cm',
  nextMeasureDate = 'Jun 2027',
}) => {
  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.heightLabel}>HEIGHT</Text>
          <Text style={styles.heightValue}>{currentHeight}</Text>
        </View>
        <Text style={styles.measuredDate}>{measuredDate}</Text>
      </View>

      {/* Stylized Growth Line Chart Canvas */}
      <View style={styles.chartCanvas}>
        {/* Background Grid Lines */}
        <View style={[styles.gridLine, { top: 20 }]} />
        <View style={[styles.gridLine, { top: 55 }]} />
        <View style={[styles.gridLine, { top: 90 }]} />

        {/* Diagonal Trend Line (Orange) */}
        <View style={styles.trendLine} />

        {/* Point Markers */}
        <View style={[styles.pointMarker, { left: '10%', bottom: 24 }]} />
        <View style={[styles.pointMarker, { left: '30%', bottom: 42 }]} />
        <View style={[styles.pointMarker, { left: '50%', bottom: 58 }]} />
        <View style={[styles.pointMarker, { left: '70%', bottom: 74 }]} />
        <View style={[styles.pointMarkerActive, { left: '90%', bottom: 90 }]}>
          <View style={styles.innerDot} />
        </View>

        {/* X-Axis Labels */}
        <View style={styles.xAxisRow}>
          <Text style={styles.axisText}>5 yrs</Text>
          <Text style={styles.axisText}>6</Text>
          <Text style={styles.axisText}>7</Text>
          <Text style={styles.axisText}>8</Text>
          <Text style={styles.axisText}>9 yrs</Text>
        </View>
      </View>

      {/* 3 Metrics Boxes */}
      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Weight</Text>
          <Text style={styles.metricValue}>{weight}</Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Grew this year</Text>
          <Text style={styles.metricValue}>{grewThisYear}</Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Next measure</Text>
          <Text style={styles.metricValue}>{nextMeasureDate}</Text>
        </View>
      </View>
    </View>
  );
};

export default GrowthLineChart;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#0B1E36',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 20,
    marginTop: 14,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  heightLabel: {
    color: '#8E9BAE',
    fontSize: RFValue(10.5),
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  heightValue: {
    color: '#FFFFFF',
    fontSize: RFValue(24),
    fontWeight: '700',
    marginTop: 2,
  },
  measuredDate: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
    marginTop: 4,
  },
  chartCanvas: {
    height: 140,
    position: 'relative',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  trendLine: {
    position: 'absolute',
    left: '10%',
    bottom: 30,
    width: '82%',
    height: 2.5,
    backgroundColor: Colors.primary || '#F0913A',
    transform: [{ rotate: '-19deg' }, { translateY: -15 }],
  },
  pointMarker: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary || '#F0913A',
  },
  pointMarkerActive: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(240, 145, 58, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary || '#F0913A',
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
  },
  axisText: {
    color: '#8E9BAE',
    fontSize: RFValue(11),
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#071526',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  metricLabel: {
    color: '#8E9BAE',
    fontSize: RFValue(10.5),
    textAlign: 'center',
    marginBottom: 4,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: RFValue(13),
    fontWeight: '700',
    textAlign: 'center',
  },
});

