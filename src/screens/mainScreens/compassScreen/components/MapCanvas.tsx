import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import Ionicons from '@react-native-vector-icons/ionicons';
import { CompassMember, FamilyPlace, PlaceType } from '../types';

const ROUTE_POINTS: [number, number][] = [
  [21.0, 22.8], [21.9, 23.2], [22.8, 23.7], [23.7, 24.1], [24.6, 24.6],
  [25.5, 25.0], [26.2, 25.6], [26.9, 26.2], [27.6, 26.8], [28.3, 27.4],
  [29.0, 28.0], [29.7, 28.7], [30.4, 29.4], [31.1, 30.1], [31.8, 30.8],
  [32.5, 31.5], [33.6, 32.1], [34.7, 32.7], [35.8, 33.3], [36.9, 33.9],
  [38.0, 34.5], [39.6, 34.9], [41.2, 35.3], [42.8, 35.7], [44.4, 36.1],
  [46.0, 36.5], [47.6, 36.7], [49.2, 36.9], [50.8, 37.1], [52.4, 37.3],
  [54.0, 37.5], [55.4, 37.7], [56.8, 37.9], [58.2, 38.1], [59.6, 38.3],
  [61.0, 38.5], [61.9, 38.8], [62.8, 39.1], [63.7, 39.4], [64.6, 39.7],
  [65.5, 40.0], [65.9, 40.5], [66.3, 41.0], [66.7, 41.5], [67.1, 42.0],
  [67.5, 42.5], [67.3, 43.0], [67.1, 43.5], [66.9, 44.0], [66.7, 44.5],
  [66.5, 45.0], [66.0, 45.6], [65.5, 46.2], [65.1, 46.8], [64.6, 47.4],
  [64.1, 48.0],
];

interface MapCanvasProps {
  mode?: 'overview' | 'headingHome' | 'geofence' | 'placesOverview';
  members?: CompassMember[];
  places?: FamilyPlace[];
  selectedMemberId?: string;
  selectedPlaceType?: PlaceType;
  geofenceRadius?: number;
  onSelectMember?: (member: CompassMember) => void;
  onSelectPlace?: (place: FamilyPlace) => void;
  style?: ViewStyle;
  isMini?: boolean;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  mode = 'overview',
  members = [],
  places = [],
  selectedMemberId,
  selectedPlaceType = 'activity',
  geofenceRadius = 200,
  onSelectMember,
  onSelectPlace,
  style,
  isMini = false,
}) => {
  const getPlaceIcon = (type: PlaceType) => {
    switch (type) {
      case 'home':
        return 'home';
      case 'school':
        return 'book-open';
      case 'work':
        return 'briefcase';
      case 'activity':
        return 'disc';
      case 'store':
        return 'shopping-bag';
      default:
        return 'map-pin';
    }
  };

  const getPlaceColor = (type: PlaceType) => {
    switch (type) {
      case 'home':
        return '#F0913A';
      case 'school':
        return '#3A8EF0';
      case 'work':
        return '#F06A6A';
      case 'activity':
        return '#4CC38A';
      case 'store':
        return '#3CC4C4';
      default:
        return '#CAD4DF';
    }
  };

  return (
    <View style={[styles.canvasContainer, isMini ? styles.canvasMini : styles.canvasFull, style]}>
      {/* City Grid / Block Backgrounds */}
      <View style={styles.gridLayer}>
        {/* Top-left block */}
        <View style={[styles.cityBlock, { top: '8%', left: '8%', width: '38%', height: '22%' }]} />
        {/* Top-right block */}
        <View style={[styles.cityBlock, { top: '8%', right: '8%', width: '40%', height: '22%' }]} />
        {/* Mid-left park */}
        <View style={[styles.cityBlock, styles.parkBlock, { top: '34%', left: '8%', width: '36%', height: '26%' }]} />
        {/* Mid-right block */}
        <View style={[styles.cityBlock, { top: '34%', right: '8%', width: '42%', height: '26%' }]} />
        {/* Bottom-right park */}
        <View style={[styles.cityBlock, styles.parkBlock, { bottom: '8%', right: '8%', width: '42%', height: '24%' }]} />
        {/* Bottom-left block */}
        <View style={[styles.cityBlock, { bottom: '8%', left: '8%', width: '36%', height: '24%' }]} />

        {/* Major Arterial Roads */}
        <View style={styles.roadHorizontal1} />
        <View style={styles.roadHorizontal2} />
        <View style={styles.roadVertical1} />
        <View style={styles.roadVertical2} />
        {/* Diagonal Highway */}
        <View style={styles.highwayDiagonal} />
      </View>

      {/* Geofence Mode: centered icon with dashed radius circle */}
      {mode === 'geofence' && (
        <View style={styles.geofenceOverlay}>
          <View
            style={[
              styles.geofenceCircle,
              {
                width: geofenceRadius === 100 ? 110 : geofenceRadius === 200 ? 150 : 190,
                height: geofenceRadius === 100 ? 110 : geofenceRadius === 200 ? 150 : 190,
                borderRadius: geofenceRadius === 100 ? 55 : geofenceRadius === 200 ? 75 : 95,
              },
            ]}
          />
          <View style={[styles.placePinBadge, { backgroundColor: getPlaceColor(selectedPlaceType) + '22', borderColor: getPlaceColor(selectedPlaceType) }]}>
            {selectedPlaceType === 'school' ? (
              <Ionicons name="school-outline" size={20} color={getPlaceColor(selectedPlaceType)} />
            ) : selectedPlaceType === 'store' ? (
              <Ionicons name="storefront-outline" size={20} color={getPlaceColor(selectedPlaceType)} />
            ) : (
              <Feather name={getPlaceIcon(selectedPlaceType)} size={20} color={getPlaceColor(selectedPlaceType)} />
            )}
          </View>
        </View>
      )}

      {/* Heading Home Route Curve */}
      {mode === 'headingHome' && (
        <View style={styles.routeLayer} pointerEvents="none">
          {/* Continuous smooth vector curve */}
          {ROUTE_POINTS.map(([x, y], idx) => (
            <View
              key={idx}
              style={[
                styles.routePointDot,
                { left: `${x}%`, top: `${y}%` },
              ]}
            />
          ))}

          {/* Start Avatar P (x: 21%, y: 22.8%) */}
          <View style={[styles.routeAvatarPin, { top: '22.8%', left: '21%' }]}>
            <View style={styles.avatarBorderWrapper}>
              <View style={[styles.memberAvatarCircle, { backgroundColor: '#784D1A' }]}>
                <Text style={styles.avatarInitial}>P</Text>
              </View>
            </View>
          </View>

          {/* Destination Home Pin (x: 64.1%, y: 48.0%) */}
          <View style={[styles.routeDestinationPin, { top: '48.0%', left: '64.1%' }]}>
            <View style={[styles.placePinBadge, { borderColor: '#F0913A', backgroundColor: '#0B192E' }]}>
              <Feather name="home" size={20} color="#F0913A" />
            </View>
          </View>
        </View>
      )}

      {/* Places Pins (CMP-01, CMP-06, CMP-05) */}
      {(mode === 'overview' || mode === 'placesOverview') && (
        <View style={styles.pinsLayer} pointerEvents="box-none">
          {/* Office Place Pin */}
          <TouchableOpacity
            style={[styles.placePinWrapper, { top: '16%', left: '12%' }]}
            activeOpacity={0.8}
            onPress={() => onSelectPlace?.(places.find((p) => p.type === 'work') || places[2])}
          >
            <View style={[styles.placePinBadge, { borderColor: '#F06A6A' }]}>
              <Feather name="briefcase" size={16} color="#F06A6A" />
            </View>
          </TouchableOpacity>

          {/* School Place Pin */}
          <TouchableOpacity
            style={[styles.placePinWrapper, { top: '22%', right: '18%' }]}
            activeOpacity={0.8}
            onPress={() => onSelectPlace?.(places.find((p) => p.type === 'school') || places[1])}
          >
            <View style={[styles.placePinBadge, { borderColor: '#3A8EF0' }]}>
              <Ionicons name="school" size={16} color="#3A8EF0" />
            </View>
          </TouchableOpacity>

          {/* Home Place Pin */}
          <TouchableOpacity
            style={[styles.placePinWrapper, { top: '38%', left: '46%' }]}
            activeOpacity={0.8}
            onPress={() => onSelectPlace?.(places.find((p) => p.type === 'home') || places[0])}
          >
            <View style={[styles.placePinBadge, { borderColor: '#F0913A' }]}>
              <Feather name="home" size={16} color="#F0913A" />
            </View>
          </TouchableOpacity>

          {/* Activity Place Pin */}
          <TouchableOpacity
            style={[styles.placePinWrapper, { top: '48%', right: '14%' }]}
            activeOpacity={0.8}
            onPress={() => onSelectPlace?.(places.find((p) => p.type === 'activity') || places[3])}
          >
            <View style={[styles.placePinBadge, { borderColor: '#4CC38A' }]}>
              <Feather name="disc" size={16} color="#4CC38A" />
            </View>
          </TouchableOpacity>

          {/* Store Place Pin (CMP-06) */}
          {mode === 'placesOverview' && (
            <TouchableOpacity
              style={[styles.placePinWrapper, { bottom: '15%', left: '56%' }]}
              activeOpacity={0.8}
              onPress={() => onSelectPlace?.(places.find((p) => p.type === 'store') || places[4])}
            >
              <View style={[styles.placePinBadge, { borderColor: '#3CC4C4' }]}>
                <Ionicons name="storefront-outline" size={16} color="#3CC4C4" />
              </View>
            </TouchableOpacity>
          )}

          {/* Member Avatars Overlay (CMP-01 & CMP-05) */}
          {mode === 'overview' &&
            members
              .filter((m) => m.isSharing)
              .map((member) => {
                const isSelected = selectedMemberId === member.id;
                const isYou = member.id === 'priya';
                return (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      styles.memberPinWrapper,
                      { top: `${member.coords.y}%`, left: `${member.coords.x}%` },
                      isSelected && styles.memberPinSelected,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => onSelectMember?.(member)}
                    accessibilityLabel={`Location of ${member.name}`}
                  >
                    <View style={[styles.avatarBorderWrapper, isYou && styles.avatarBorderWrapperYou]}>
                      <View style={[styles.memberAvatarCircle, { backgroundColor: member.bgColor }]}>
                        <Text style={[styles.avatarInitial, { color: member.textColor || '#FFFFFF' }]}>
                          {member.initial}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  canvasContainer: {
    backgroundColor: '#091527',
    overflow: 'hidden',
    position: 'relative',
  },
  canvasFull: {
    flex: 1,
    width: '100%',
  },
  canvasMini: {
    height: 180,
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F3352',
  },
  gridLayer: {
    ...StyleSheet.absoluteFill,
  },
  cityBlock: {
    position: 'absolute',
    backgroundColor: '#11223A',
    borderRadius: 14,
  },
  parkBlock: {
    backgroundColor: '#0E241E',
  },
  roadHorizontal1: {
    position: 'absolute',
    top: '31%',
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: '#091527',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#172B47',
  },
  roadHorizontal2: {
    position: 'absolute',
    top: '61%',
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: '#091527',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#172B47',
  },
  roadVertical1: {
    position: 'absolute',
    left: '46%',
    top: 0,
    bottom: 0,
    width: 18,
    backgroundColor: '#091527',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#172B47',
  },
  roadVertical2: {
    position: 'absolute',
    right: '20%',
    top: 0,
    bottom: 0,
    width: 16,
    backgroundColor: '#091527',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#172B47',
  },
  highwayDiagonal: {
    position: 'absolute',
    top: '46%',
    left: '-15%',
    width: '130%',
    height: 22,
    backgroundColor: '#1A3357',
    transform: [{ rotate: '-18deg' }],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#244572',
  },
  pinsLayer: {
    ...StyleSheet.absoluteFill,
  },
  placePinWrapper: {
    position: 'absolute',
    zIndex: 5,
  },
  placePinBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#0E1D31',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  memberPinWrapper: {
    position: 'absolute',
    zIndex: 10,
  },
  memberPinSelected: {
    transform: [{ scale: 1.15 }],
  },
  avatarBorderWrapper: {
    padding: 2,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarBorderWrapperYou: {
    backgroundColor: '#F0913A',
  },
  memberAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
  },
  routeLayer: {
    ...StyleSheet.absoluteFill,
  },
  routePointDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0913A',
    marginLeft: -3,
    marginTop: -3,
    shadowColor: '#F0913A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
  routeAvatarPin: {
    position: 'absolute',
    zIndex: 12,
    marginLeft: -18,
    marginTop: -18,
  },
  routeDestinationPin: {
    position: 'absolute',
    zIndex: 12,
    marginLeft: -19,
    marginTop: -19,
  },
  geofenceOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  geofenceCircle: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#F0913A',
    backgroundColor: '#F0913A14',
  },
});
