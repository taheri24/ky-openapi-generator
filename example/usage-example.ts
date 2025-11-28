/**
 * Example usage of the generated Ky API client
 */

import ApiClient from './generated-client';

async function main() {
  // Create an instance of the API client
  const client = new ApiClient('https://petstore.swagger.io/v1');

  try {
    // Example 1: List all pets with limit
    console.log('Listing all pets with limit 5...');
    const petsList = await client.listPets(
      { limit: 5 },
      { timeout: 5000 }
    );
    console.log('Pets:', petsList.data);

    // Example 2: Create a new pet
    console.log('\nCreating a new pet...');
    const newPet = await client.createPets(
      { name: 'Fluffy', tag: 'cat' },
      { timeout: 5000 }
    );
    console.log('Created pet:', newPet.data);

    // Example 3: Get a specific pet by ID
    console.log('\nFetching pet with ID 1...');
    const pet = await client.showPetById(
      { petId: '1' },
      { timeout: 5000 }
    );
    console.log('Pet details:', pet.data);

    // Example 4: Update a pet
    console.log('\nUpdating pet with ID 1...');
    const updatedPet = await client.updatePetById(
      { petId: '1' },
      { name: 'Fluffy', tag: 'kitten' },
      { timeout: 5000 }
    );
    console.log('Updated pet:', updatedPet.data);

    // Example 5: Delete a pet
    console.log('\nDeleting pet with ID 1...');
    await client.deletePetById(
      { petId: '1' },
      { timeout: 5000 }
    );
    console.log('Pet deleted successfully');

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Unknown error occurred');
    }
  }
}

main();
