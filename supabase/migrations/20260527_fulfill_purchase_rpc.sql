CREATE OR REPLACE FUNCTION public.fulfill_purchase(
  p_user_id UUID,
  p_card_id UUID,
  p_stripe_payment_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_card RECORD;
BEGIN
  -- 1. Check for idempotency (already fulfilled)
  IF EXISTS (SELECT 1 FROM public.purchase_records WHERE stripepaymentid = p_stripe_payment_id) THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already fulfilled');
  END IF;

  -- 2. Fetch card details
  SELECT * INTO v_card FROM public.payment_cards WHERE id = p_card_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Card not found');
  END IF;

  -- 3. Update user passes
  UPDATE public.users 
  SET remainingpasses = remainingpasses + (CASE WHEN v_card.passes = -1 THEN 9999 ELSE v_card.passes END)
  WHERE id = p_user_id;
  
  -- 4. Record the purchase
  INSERT INTO public.purchase_records (
    userid, 
    cardid, 
    cardname, 
    price, 
    passesadded, 
    stripepaymentid
  )
  VALUES (
    p_user_id, 
    p_card_id, 
    v_card.title, 
    v_card.price, 
    (CASE WHEN v_card.passes = -1 THEN 9999 ELSE v_card.passes END), 
    p_stripe_payment_id
  );

  RETURN jsonb_build_object('success', true);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
