import React from 'react';
import { Provider } from '@/types/chat';
import { Star, MapPin } from 'lucide-react';

interface ProviderCardProps {
  provider: Provider;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{provider.name}</h3>
      <p className="text-gray-600 mb-4">{provider.description}</p>
      
      <div className="flex items-center mb-3">
        <div className="flex items-center">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="ml-1 text-sm font-medium text-gray-900">{provider.rating}</span>
          <span className="mx-1 text-gray-500">of 5 stars from</span>
          <span className="text-sm text-gray-600">{provider.reviewCount} reviews on Google</span>
        </div>
      </div>
      
      <div className="flex items-center text-gray-600 mb-4">
        <MapPin className="h-4 w-4 mr-1" />
        <span className="text-sm">{provider.address}</span>
      </div>
      
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500">Initial Consultation charges are </span>
            <span className="text-sm font-semibold">${provider.consultationFee}.</span>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">With Toothsome it will be </span>
            <span className="text-lg font-bold text-green-600">${provider.discountedFee}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;