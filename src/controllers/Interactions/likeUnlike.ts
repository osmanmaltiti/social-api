import { Response } from 'express';
import createHttpError from 'http-errors';
import { CustomRequest } from '../../@types';
import { Post } from '../../mongoose/schema';

const postNotFound = new createHttpError.BadRequest();

export const likePost = async (req: CustomRequest, res: Response) => {
  const { postId, uid } = req.body;

  try {
    const post = await Post.findOne({ postId });

    if (post) {
      const hasLikedPost = post.likes?.some((item) => item === uid);
      const hasUnlikedPost = post.unlikes?.some((item) => item === uid);

      if (hasLikedPost) {
        const removeLike = post.likes?.filter((item) => item !== uid);
        const updateLikes = await Post.updateOne(
          { postId },
          { likes: removeLike }
        );

        res
          .status(200)
          .json({ status: 'Success', message: updateLikes.acknowledged });
      } else {
        const postLikes = post.likes as [];
        const liked = await Post.updateOne(
          { postId },
          { likes: [...postLikes, uid] }
        );

        if (hasUnlikedPost) {
          const removeUnlike = post.unlikes?.filter((item) => item !== uid);
          await Post.updateOne({ postId }, { unlikes: removeUnlike });
        }

        res
          .status(200)
          .json({ status: 'Success', message: liked.acknowledged });
      }
    } else {
      postNotFound.message = 'Post Not Found';
      throw postNotFound;
    }
  } catch (error) {
    if (error instanceof createHttpError.HttpError) {
      res
        .status(error.status)
        .json({ status: 'Failed', message: error.message });
    }
  }
};

export const unlikePost = async (req: CustomRequest, res: Response) => {
  const { postId, uid } = req.body;

  try {
    const post = await Post.findOne({ postId });

    if (post) {
      const hasUnlikedPost = post.unlikes?.some((item) => item === uid);
      const hasLikedPost = post.likes?.some((item) => item === uid);

      if (hasUnlikedPost) {
        const removeUnlike = post.unlikes?.filter((item) => item !== uid);
        const updateUnlikes = await Post.updateOne(
          { postId },
          { unlikes: removeUnlike }
        );

        res
          .status(200)
          .json({ status: 'Success', message: updateUnlikes.acknowledged });
      } else {
        const postUnlikes = post.unlikes as [];
        const unliked = await Post.updateOne(
          { postId },
          { unlikes: [...postUnlikes, uid] }
        );

        if (hasLikedPost) {
          const removeLike = post.likes?.filter((item) => item !== uid);
          await Post.updateOne({ postId }, { likes: removeLike });
        }

        res
          .status(200)
          .json({ status: 'Success', message: unliked.acknowledged });
      }
    } else {
      postNotFound.message = 'Post Not Found';
      throw postNotFound;
    }
  } catch (error) {
    if (error instanceof createHttpError.HttpError) {
      res
        .status(error.status)
        .json({ status: 'Failed', message: error.message });
    }
  }
};
