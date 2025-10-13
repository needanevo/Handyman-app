export interface ServiceCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  fullDescription: string;
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'drywall',
    title: 'Drywall',
    icon: 'hammer-outline',
    color: '#FF6B35',
    description: 'Patches, repairs, texturing',
    fullDescription: 'Expert drywall repair and installation. We handle small patches, large repairs, texture matching, and full installations. Fast turnaround for holes, cracks, and water damage.',
  },
  {
    id: 'painting',
    title: 'Painting',
    icon: 'brush-outline',
    color: '#4ECDC4',
    description: 'Interior, exterior, touch-ups',
    fullDescription: 'Professional painting services for interior and exterior spaces. We provide color consultation, preparation, priming, and finishing. Touch-ups and full room makeovers available.',
  },
  {
    id: 'electrical',
    title: 'Electrical',
    icon: 'flash-outline',
    color: '#45B7D1',
    description: 'Outlets, switches, fixtures',
    fullDescription: 'Licensed electrical work including outlet installation, switch replacement, light fixture upgrades, ceiling fan installation, and minor electrical repairs. All work code-compliant.',
  },
  {
    id: 'plumbing',
    title: 'Plumbing',
    icon: 'water-outline',
    color: '#96CEB4',
    description: 'Faucets, leaks, installations',
    fullDescription: 'Reliable plumbing services for faucet repairs, leak fixes, drain clearing, toilet installation, garbage disposal replacement, and water heater maintenance.',
  },
  {
    id: 'carpentry',
    title: 'Carpentry',
    icon: 'construct-outline',
    color: '#FECA57',
    description: 'Doors, trim, repairs',
    fullDescription: 'Skilled carpentry for door installation and repair, trim work, baseboards, crown molding, custom shelving, and general woodwork repairs.',
  },
  {
    id: 'roofing',
    title: 'Roofing',
    icon: 'home-outline',
    color: '#E74C3C',
    description: 'Leak repairs, shingle replacement',
    fullDescription: 'Roofing repair and maintenance including leak detection and repair, shingle replacement, flashing repair, gutter work, and roof inspections. Emergency repairs available.',
  },
  {
    id: 'hvac',
    title: 'HVAC',
    icon: 'snow-outline',
    color: '#9B59B6',
    description: 'AC, heating, maintenance',
    fullDescription: 'HVAC services including air conditioning repair, heating system maintenance, filter replacement, thermostat installation, and seasonal tune-ups to keep your system running efficiently.',
  },
  {
    id: 'appliances',
    title: 'Appliances',
    icon: 'cube-outline',
    color: '#34495E',
    description: 'Repair, installation, service',
    fullDescription: 'Appliance installation and repair for refrigerators, washers, dryers, dishwashers, ovens, and microwaves. We diagnose issues and provide honest recommendations.',
  },
  {
    id: 'miscellaneous',
    title: 'Other',
    icon: 'build-outline',
    color: '#A29BFE',
    description: 'TV mounts, honey-do lists',
    fullDescription: 'General handyman services including TV mounting, picture hanging, furniture assembly, smart home device installation, and those honey-do list items you\'ve been putting off.',
  },
];
