import React, { useMemo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import qrcode from 'qrcode-generator';

export interface QRCodeViewProps {
  value: string;
  size?: number;
  backgroundColor?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
  padding?: number;
}

const QRCodeView: React.FC<QRCodeViewProps> = ({
  value,
  size = 200,
  backgroundColor = '#FFFFFF',
  color = '#000000',
  style,
  padding = 12,
}) => {
  const { matrix, moduleCount } = useMemo(() => {
    try {
      const qr = qrcode(0, 'M');
      qr.addData(value || ' ');
      qr.make();
      const count = qr.getModuleCount();
      const rows: boolean[][] = [];
      for (let r = 0; r < count; r++) {
        const row: boolean[] = [];
        for (let c = 0; c < count; c++) {
          row.push(qr.isDark(r, c));
        }
        rows.push(row);
      }
      return { matrix: rows, moduleCount: count };
    } catch (e) {
      console.warn('Failed to generate QR matrix:', e);
      return { matrix: [], moduleCount: 0 };
    }
  }, [value]);

  if (!matrix.length || moduleCount === 0) {
    return (
      <View
        style={[
          styles.container,
          { width: size, height: size, backgroundColor },
          style,
        ]}
      />
    );
  }

  const innerSize = size - padding * 2;
  const cellSize = innerSize / moduleCount;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor,
          padding,
        },
        style,
      ]}
    >
      {matrix.map((row, r) => (
        <View key={r} style={[styles.row, { height: cellSize }]}>
          {row.map((cell, c) => (
            <View
              key={c}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: cell ? color : backgroundColor,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
});

export default QRCodeView;

