<?php get_header(); ?>

<main id="primary" class="site-main">
    <?php
    if (have_posts()) :
        while (have_posts()) :
            the_post();
            ?>
            <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                <header class="entry-header">
                    <h2 class="entry-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                    <div class="entry-meta">
                        <?php
                        printf(
                            esc_html__('Posted on %s', 'cal-ai-inspired'),
                            '<time class="entry-date published" datetime="' . esc_attr(get_the_date('c')) . '">' . esc_html(get_the_date()) . '</time>'
                        );
                        ?>
                    </div>
                </header>

                <div class="entry-content">
                    <?php the_excerpt(); ?>
                </div>
            </article>
        <?php
        endwhile;

        the_posts_pagination();
    else :
        ?>
        <p><?php esc_html_e('No posts found.', 'cal-ai-inspired'); ?></p>
    <?php endif; ?>
</main>

<?php get_sidebar(); ?>
<?php get_footer(); ?>