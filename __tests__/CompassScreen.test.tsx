import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CompassModal } from '../src/screens/mainScreens/compassScreen';
import HomeScreen from '../src/screens/mainScreens/homeScreen/HomeScreen';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const renderWithProvider = async (element: React.ReactElement) => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        {element}
      </SafeAreaProvider>
    );
  });
  return renderer!;
};

describe('CompassScreen & Heading Home Suite (CMP-01 to CMP-13)', () => {
  it('CMP-01: renders Compass main screen with header, quick pills, and member list', async () => {
    const onClose = jest.fn();
    const renderer = await renderWithProvider(
      <CompassModal visible={true} onClose={onClose} initialScreen="compass" />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Compass');
    expect(texts).toContain('I’m heading home');
    expect(texts).toContain('Places');
    expect(texts).toContain('Reminders');
    expect(texts).toContain('Where everyone is');
    expect(texts).toContain('4 of 5 sharing');
    expect(texts).toContain('You · Home');
    expect(texts).toContain('Rohan · Rohan’s office');
    expect(texts).toContain('Aarav · St. Mary’s School');
    expect(texts).toContain('Anaya · Lodhi Sports Complex');
  });

  it('CMP-08: renders Heading Home screen when opened with initialScreen="headingHome"', async () => {
    const onClose = jest.fn();
    const renderer = await renderWithProvider(
      <CompassModal visible={true} onClose={onClose} initialScreen="headingHome" />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Heading home');
    expect(texts).toContain('Home in 24 min');
    expect(texts).toContain('Arrive around 6:42 PM · Moderate traffic on Golf Course Road');
    expect(texts).toContain('Traffic gets heavier after 6:30 PM. Leaving now saves about 10 minutes.');
    expect(texts).toContain('Share my ETA with family');
    expect(texts).toContain('At home now');
    expect(texts).toContain('Start');
  });

  it('CMP-09: tapping Start in Heading Home opens Share ETA dialog', async () => {
    const onClose = jest.fn();
    const renderer = await renderWithProvider(
      <CompassModal visible={true} onClose={onClose} initialScreen="headingHome" />
    );

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const startBtn = buttons.find(
      (b) => b.props.accessibilityLabel === 'Start heading home'
    );
    expect(startBtn).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      startBtn!.props.onPress();
    });

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Share your ETA?');
    expect(texts).toContain(
      'Your family will see that you’re on the way and when you’ll arrive. Sharing stops when you reach home.'
    );
    expect(texts).toContain('Everyone in the family');
    expect(texts).toContain('Rohan, Dadi, Anaya, Aarav');
    expect(texts).toContain('Choose people');
    expect(texts).toContain('Share ETA');
    expect(texts).toContain('Don’t share');
  });

  it('CMP-06: renders Family Places list with all saved places and add button', async () => {
    const onClose = jest.fn();
    const renderer = await renderWithProvider(
      <CompassModal visible={true} onClose={onClose} initialScreen="familyPlaces" />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Family places');
    expect(texts).toContain('Home');
    expect(texts).toContain('St. Mary’s School');
    expect(texts).toContain('Rohan’s office');
    expect(texts).toContain('Lodhi Sports Complex');
    expect(texts).toContain('Modern Bazaar');
    expect(texts).toContain('You, Dadi and Anaya are here');
    expect(texts).toContain('Aarav is here');
    expect(texts).toContain('Rohan is here');
    expect(texts).toContain('Add a place');
  });

  it('CMP-07: renders New Place modal with input fields, types, and alert radius', async () => {
    const onClose = jest.fn();
    const renderer = await renderWithProvider(
      <CompassModal visible={true} onClose={onClose} initialScreen="addEditPlace" />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('New place');
    expect(texts).toContain('Name');
    expect(texts).toContain('TYPE');
    expect(texts).toContain('Address');
    expect(texts).toContain('ALERT RADIUS');
    expect(texts).toContain('Alerts when someone is this close');
    expect(texts).toContain('Lodhi Sports Complex, Lodhi Road, New Delhi');
    expect(texts).toContain('Save place');
  });

  it('CMP-11: renders Location Reminders with active/done tabs and reminders list', async () => {
    const onClose = jest.fn();
    const renderer = await renderWithProvider(
      <CompassModal visible={true} onClose={onClose} initialScreen="locationReminders" />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Location reminders');
    expect(texts).toContain('Active · 3');
    expect(texts).toContain('Done');
    expect(texts).toContain('“Always allow” is on, so these work in the background.');
    expect(texts).toContain('Pick up atta and dal');
    expect(texts).toContain('Message Dadi that you’re leaving');
    expect(texts).toContain('Collect Aarav’s report card');
    expect(texts).toContain('New location reminder');
  });

  it('CMP-12: renders Create Location Reminder modal with mode chips and details', async () => {
    const onClose = jest.fn();
    const renderer = await renderWithProvider(
      <CompassModal visible={true} onClose={onClose} initialScreen="createReminder" />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('New location reminder');
    expect(texts).toContain('Remind me to');
    expect(texts).toContain('When I arrive');
    expect(texts).toContain('When I leave');
    expect(texts).toContain('Place');
    expect(texts).toContain('Modern Bazaar · Sector 45');
    expect(texts).toContain('Remind');
    expect(texts).toContain('Repeat');
    expect(texts).toContain('Every time I arrive');
    expect(texts).toContain('Save reminder');
  });

  it('CMP-05: renders Member Location sheet with status details and quick action buttons', async () => {
    const onClose = jest.fn();
    const renderer = await renderWithProvider(
      <CompassModal visible={true} onClose={onClose} initialScreen="memberLocation" />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Rohan');
    expect(texts).toContain('At Rohan’s office · Cyber City');
    expect(texts).toContain('Updated 2 min ago');
    expect(texts).toContain('Usually leaves');
    expect(texts).toContain('Around 6:00 PM');
    expect(texts).toContain('Home in');
    expect(texts).toContain('28 min with current traffic');
    expect(texts).toContain('Call');
    expect(texts).toContain('Message');
    expect(texts).toContain('Directions');
    expect(texts).toContain('Ask ETA');
  });

  it('CMP-10: renders Ask Member dialog with gentle request preview', async () => {
    const onClose = jest.fn();
    const renderer = await renderWithProvider(
      <CompassModal visible={true} onClose={onClose} initialScreen="askMemberSharing" />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Ask Dadi to turn on sharing?');
    expect(texts).toContain(
      'Dadi’s location has been off since this morning. We’ll send her a gentle request. She can say no.'
    );
    expect(texts).toContain('“Priya asked you to share your location with the family.”');
    expect(texts).toContain('Send request');
    expect(texts).toContain('Cancel');
  });

  it('CMP-13: renders Smart Actions with suggested now and toggleable shortcuts', async () => {
    const onClose = jest.fn();
    const renderer = await renderWithProvider(
      <CompassModal visible={true} onClose={onClose} initialScreen="smartActions" />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Smart actions');
    expect(texts).toContain('Shortcuts based on where your family is. You confirm before anything is sent.');
    expect(texts).toContain('✦ SUGGESTED NOW');
    expect(texts).toContain(
      'Anaya’s badminton ends at 7:30 PM. Rohan is closest. Ask him to pick her up?'
    );
    expect(texts).toContain('Confirm');
    expect(texts).toContain('Edit');
    expect(texts).toContain('Ignore');
    expect(texts).toContain('YOUR SHORTCUTS');
    expect(texts).toContain('I’m heading home');
    expect(texts).toContain('Reached safely');
    expect(texts).toContain('School run');
    expect(texts).toContain('Pickup helper');
  });

  it('CMP-02: renders Location Permission prompt screen', async () => {
    const onClose = jest.fn();
    const renderer = await renderWithProvider(
      <CompassModal visible={true} onClose={onClose} initialScreen="locationPermission" />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Share where you are with family');
    expect(texts).toContain(
      'Your family sees where you are, so they know you’re safe and can plan pickups.'
    );
    expect(texts).toContain('Know when everyone gets home');
    expect(texts).toContain('Reminders when you arrive or leave');
    expect(texts).toContain('You’re in control');
    expect(texts).toContain('Continue');
    expect(texts).toContain('Not now');
  });

  it('CMP-03: renders Location Sharing consent screen with adults and children', async () => {
    const onClose = jest.fn();
    const renderer = await renderWithProvider(
      <CompassModal visible={true} onClose={onClose} initialScreen="locationConsent" />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Location sharing');
    expect(texts).toContain(
      'Choose who shares their location with the family. Parents decide for children.'
    );
    expect(texts).toContain('ADULTS · EACH PERSON DECIDES');
    expect(texts).toContain('You');
    expect(texts).toContain('Rohan');
    expect(texts).toContain('Dadi');
    expect(texts).toContain('CHILDREN · SET BY PARENTS');
    expect(texts).toContain('Anaya');
    expect(texts).toContain('Aarav');
    expect(texts).toContain('Save');
  });

  it('CMP-04: renders Location Off overlay dialog', async () => {
    const onClose = jest.fn();
    const renderer = await renderWithProvider(
      <CompassModal visible={true} onClose={onClose} initialScreen="locationOff" />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Your location is off');
    expect(texts).toContain(
      'Your family can’t see where you are, and place reminders won’t work. This also shows when you pause sharing.'
    );
    expect(texts).toContain('Turn on in Settings');
    expect(texts).toContain('Keep it off');
  });

  it('Home screen integration: pressing "Heading home" quick action button opens Heading Home modal', async () => {
    const renderer = await renderWithProvider(<HomeScreen />);

    const buttons = renderer.root.findAllByType(TouchableOpacity);
    const headingHomeBtn = buttons.find(
      (b) => b.props.accessibilityLabel === 'Heading home'
    );
    expect(headingHomeBtn).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      headingHomeBtn!.props.onPress();
    });

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children)
      .flat();

    expect(texts).toContain('Heading home');
    expect(texts).toContain('Home in 24 min');
    expect(texts).toContain('Start');
  });
});
