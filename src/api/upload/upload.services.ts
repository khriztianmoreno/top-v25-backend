import Cloudinary from 'cloudinary'

const cloudinary = Cloudinary.v2

export async function uploadImage(image: string) {
  const result  = await cloudinary.uploader.upload(image, {
    folder: 'dataFiles',
    use_filename: true,
    unique_filename: false,
  })
  return result
}
